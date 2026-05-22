import Decimal from 'decimal.js';
import { Person, Product } from '@/lib/types';

// Set default rounding mode (ROUND_HALF_UP is standard for finance)
Decimal.set({ rounding: Decimal.ROUND_HALF_UP });

export interface SplitItem {
  name: string;
  amount: number;
  quantity: number;
}

export interface SplitResult {
  items: SplitItem[];
  total: number;
}

/**
 * Calculates how much each person spent based on the products assigned to them.
 * Uses decimal.js to prevent floating point errors (e.g. 0.1 + 0.2 = 0.30000000000000004).
 */
export function calculateSplits(people: Person[], products: Product[]): Record<string, SplitResult> {
  const splits: Record<string, SplitResult> = {};

  // Initialize splits for all people
  people.forEach((p) => {
    splits[p.id] = { items: [], total: 0 };
  });

  products.forEach((product) => {
    if (product.assignedTo.length === 0) return;

    // Use Decimal for exact money calculations
    const price = new Decimal(product.price);
    const quantity = new Decimal(product.quantity);
    const totalCost = price.times(quantity);

    if (product.splitByPercentage) {
      const totalShares = product.percentages.reduce((sum, p) => {
        return product.assignedTo.includes(p.personId) ? sum + p.percentage : sum;
      }, 0);

      const totalSharesDec = new Decimal(totalShares);

      if (totalSharesDec.greaterThan(0)) {
        product.assignedTo.forEach((personId) => {
          const assignment = product.percentages.find((p) => p.personId === personId);
          if (assignment) {
            const share = new Decimal(assignment.percentage).dividedBy(totalSharesDec);
            const itemCost = totalCost.times(share);
            
            // For UI quantity display
            const itemQty = quantity.times(share).toNumber();

            if (splits[personId] && itemCost.greaterThan(0)) {
              splits[personId].items.push({
                name: product.name,
                amount: itemCost.toDecimalPlaces(2).toNumber(),
                quantity: itemQty,
              });
              
              // We keep a running total with full precision, rounding at the end is better, 
              // but here we round per item to match what the user sees on the receipt.
              const currentTotal = new Decimal(splits[personId].total);
              splits[personId].total = currentTotal.plus(itemCost.toDecimalPlaces(2)).toNumber();
            }
          }
        });
      }
    } else {
      // Even split
      const divisor = new Decimal(product.assignedTo.length);
      // We round the cost per person to 2 decimal places to avoid infinite fractions
      const costPerPerson = totalCost.dividedBy(divisor).toDecimalPlaces(2);
      const qtyPerPerson = quantity.dividedBy(divisor).toNumber();

      product.assignedTo.forEach((personId) => {
        if (splits[personId]) {
          splits[personId].items.push({
            name: product.name,
            amount: costPerPerson.toNumber(),
            quantity: qtyPerPerson,
          });
          const currentTotal = new Decimal(splits[personId].total);
          splits[personId].total = currentTotal.plus(costPerPerson).toNumber();
        }
      });
    }
  });

  return splits;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

/**
 * Calculates who owes who based on what they spent vs what they paid.
 * Uses exact math and a greedy simplification algorithm.
 */
export function calculateOwes(
  people: Person[], 
  splits: Record<string, SplitResult>, 
  payments: Record<string, number>
): Transaction[] {
  
  // 1. Calculate net balances for each person
  const balances = people.map((person) => {
    const spent = new Decimal(splits[person.id]?.total || 0);
    const paid = new Decimal(payments[person.id] || 0);
    
    // balance = paid - spent (positive means they overpaid and are owed money)
    return {
      id: person.id,
      name: person.name,
      balance: paid.minus(spent),
    };
  });

  // 2. Separate into debtors (negative balance) and creditors (positive balance)
  // We ignore balances less than a penny (0.01)
  const PENNY = new Decimal(0.01);
  
  const debtors = balances
    .filter((b) => b.balance.lessThan(PENNY.negated()))
    .sort((a, b) => a.balance.toNumber() - b.balance.toNumber()); // most negative first
    
  const creditors = balances
    .filter((b) => b.balance.greaterThan(PENNY))
    .sort((a, b) => b.balance.toNumber() - a.balance.toNumber()); // most positive first

  const transactions: Transaction[] = [];
  let dIdx = 0;
  let cIdx = 0;

  // 3. Settle debts greedily
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const owesAmount = debtor.balance.absoluteValue();
    const creditAmount = creditor.balance;
    
    // The amount to settle is the minimum of what debtor owes and creditor is owed
    const settleAmount = Decimal.min(owesAmount, creditAmount).toDecimalPlaces(2);

    if (settleAmount.greaterThanOrEqualTo(PENNY)) {
      transactions.push({
        from: debtor.id,
        to: creditor.id,
        amount: settleAmount.toNumber(),
      });
    }

    // Update balances
    debtor.balance = debtor.balance.plus(settleAmount);
    creditor.balance = creditor.balance.minus(settleAmount);

    // Move to next if fully settled
    if (debtor.balance.absoluteValue().lessThan(PENNY)) {
      dIdx++;
    }
    if (creditor.balance.absoluteValue().lessThan(PENNY)) {
      cIdx++;
    }
  }

  return transactions;
}

/**
 * Calculates global group balances across all bills and settlements.
 * Implements the 13-step financial engine algorithm to produce a minimized 
 * list of final transactions showing exactly who owes whom.
 */
export function calculateGroupBalances(
  groupMembers: Person[],
  groupBills: { people: Person[]; products: Product[]; payments?: Record<string, number>; paidBy: string | null }[],
  settlements: { fromUserId: string; toUserId: string; amount: number }[]
): Transaction[] {
  // Step 1: Initialize Global Balances map
  const globalBalances: Record<string, Decimal> = {};
  groupMembers.forEach((m) => {
    globalBalances[m.id] = new Decimal(0);
  });

  // Steps 2-6: Process All Bills & Merge into Global Balances
  groupBills.forEach((bill) => {
    // Ignore bills that have been explicitly marked as settled by the user
    if ((bill as any).isSettled) return;

    // calculateSplits returns how much each person in the bill consumed
    const splits = calculateSplits(bill.people, bill.products);
    
    // Convert legacy paidBy to payments record for unified processing
    const payments = bill.payments || (bill.paidBy ? { [bill.paidBy]: bill.products.reduce((sum, p) => sum + p.price * p.quantity, 0) } : {});

    // For each person in the bill, merge their net balance into the global map
    bill.people.forEach((person) => {
      if (!globalBalances[person.id]) {
         globalBalances[person.id] = new Decimal(0);
      }
      
      const spent = new Decimal(splits[person.id]?.total || 0);
      const paid = new Decimal(payments[person.id] || 0);
      
      // Balance = Paid - Consumed
      const netBillBalance = paid.minus(spent);
      globalBalances[person.id] = globalBalances[person.id].plus(netBillBalance);
    });
  });

  // Step 7: Apply Settlements
  settlements.forEach((settlement) => {
    if (globalBalances[settlement.fromUserId] !== undefined && globalBalances[settlement.toUserId] !== undefined) {
      const amount = new Decimal(settlement.amount);
      // Debtor pays creditor. Debtor balance goes up (closer to 0), creditor balance goes down.
      globalBalances[settlement.fromUserId] = globalBalances[settlement.fromUserId].plus(amount);
      globalBalances[settlement.toUserId] = globalBalances[settlement.toUserId].minus(amount);
    }
  });

  // Prepare balances array for greedy algorithm (Steps 8-9)
  const PENNY = new Decimal(0.01);
  const finalBalances = Object.keys(globalBalances).map((userId) => {
    return {
      id: userId,
      balance: globalBalances[userId],
    };
  });

  // Step 9: Split into Creditors & Debtors
  const debtors = finalBalances
    .filter((b) => b.balance.lessThan(PENNY.negated()))
    .sort((a, b) => a.balance.toNumber() - b.balance.toNumber());
    
  const creditors = finalBalances
    .filter((b) => b.balance.greaterThan(PENNY))
    .sort((a, b) => b.balance.toNumber() - a.balance.toNumber());

  const transactions: Transaction[] = [];
  let dIdx = 0;
  let cIdx = 0;

  // Step 10: Debt Simplification Algorithm
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const owesAmount = debtor.balance.absoluteValue();
    const creditAmount = creditor.balance;
    
    const settleAmount = Decimal.min(owesAmount, creditAmount).toDecimalPlaces(2);

    if (settleAmount.greaterThanOrEqualTo(PENNY)) {
      transactions.push({
        from: debtor.id,
        to: creditor.id,
        amount: settleAmount.toNumber(),
      });
    }

    debtor.balance = debtor.balance.plus(settleAmount);
    creditor.balance = creditor.balance.minus(settleAmount);

    if (debtor.balance.absoluteValue().lessThan(PENNY)) {
      dIdx++;
    }
    if (creditor.balance.absoluteValue().lessThan(PENNY)) {
      cIdx++;
    }
  }

  return transactions;
}
