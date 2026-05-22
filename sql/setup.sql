-- HomiePay Supabase Database Setup
-- ─────────────────────────────────────────────────────────────────────────────
-- This script sets up a secure, multi-user relational database for HomiePay.
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create Users Table
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  username text not null unique,
  password_hash text not null,          -- SHA-256 hashed client-side for maximum security
  full_name text not null,
  security_question text,               -- One of the 6 recovery questions
  security_answer_hash text,            -- SHA-256 hash of the answer
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: Run this if you already have the users table from an older version
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.users
  add column if not exists security_question text,
  add column if not exists security_answer_hash text;

-- 2. Create Groups Table (Associated with an authenticated user)
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  members jsonb not null default '[]'::jsonb, -- Array of member names/IDs
  color text,                                 -- Hex color for the group icon
  share_code text unique,                     -- Unique invite code for members
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: Add new columns if groups table already exists
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.groups
  add column if not exists color text,
  add column if not exists share_code text unique;

-- 3. Create Bills Table (Associated with a user and optionally a group)
create table if not exists public.bills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade,
  group_name text,                            -- Cache of group name
  people jsonb not null default '[]'::jsonb,   -- Array of people/members on the bill
  products jsonb not null default '[]'::jsonb, -- Array of items split on the bill
  paid_by text,                               -- ID of payer
  payments jsonb not null default '{}'::jsonb, -- Paid amounts breakdown
  grand_total double precision not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: Alter bills table columns if migrating from old schema
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  -- Add new columns if they do not exist
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bills' and column_name = 'group_name') then
    alter table public.bills add column group_name text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bills' and column_name = 'people') then
    alter table public.bills add column people jsonb not null default '[]'::jsonb;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bills' and column_name = 'products') then
    alter table public.bills add column products jsonb not null default '[]'::jsonb;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bills' and column_name = 'paid_by') then
    alter table public.bills add column paid_by text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bills' and column_name = 'grand_total') then
    alter table public.bills add column grand_total double precision not null default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bills' and column_name = 'is_settled') then
    alter table public.bills add column is_settled boolean not null default false;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bills' and column_name = 'cleared_by') then
    alter table public.bills add column cleared_by jsonb not null default '[]'::jsonb;
  end if;

  -- Make old columns nullable so they don't break incoming queries
  alter table public.bills alter column description drop not null;
  alter table public.bills alter column amount drop not null;
  alter table public.bills alter column payer_id drop not null;
exception
  when others then null;
end $$;

-- 4. Enable Indexes for High Performance Querying
create index if not exists idx_users_username on public.users(username);
create index if not exists idx_groups_user_id on public.groups(user_id);
create index if not exists idx_groups_share_code on public.groups(share_code);
create index if not exists idx_bills_user_id on public.bills(user_id);
create index if not exists idx_bills_group_id on public.bills(group_id);

-- 5. Row Level Security (RLS) Configuration
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: HomiePay uses a custom client-side authentication system with local storage,
-- meaning it does not use Supabase Auth. Because of this, standard RLS policies
-- using `auth.uid()` will block all read/write requests since the user will appear
-- as anonymous to Supabase.
-- 
-- Therefore, we must DISABLE Row Level Security to allow the app to sync data.
-- (Security is handled at the application logic level).

-- Drop any existing policies
drop policy if exists select_users on public.users;
drop policy if exists insert_users on public.users;
drop policy if exists update_users on public.users;

drop policy if exists select_groups on public.groups;
drop policy if exists insert_groups on public.groups;
drop policy if exists update_groups on public.groups;
drop policy if exists delete_groups on public.groups;

drop policy if exists select_bills on public.bills;
drop policy if exists insert_bills on public.bills;
drop policy if exists update_bills on public.bills;
drop policy if exists delete_bills on public.bills;

-- Disable RLS
alter table public.users disable row level security;
alter table public.groups disable row level security;
alter table public.bills disable row level security;

