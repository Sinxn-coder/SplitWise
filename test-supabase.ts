import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ksdegmsuhzqqdlnzsqmu.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZGVnbXN1aHpxcWRsbnpzcW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODYzNjAsImV4cCI6MjA5NDc2MjM2MH0.wasZ_gQLkZsVT80rzpDz_6KexfK4qVA2gWnjcMh5rog'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function test() {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    // test json array contains
    .contains('members', [{ userId: "12345678-1234-1234-1234-123456789012" }])
  
  console.log("Error:", error)
  console.log("Data:", data)
}

test()
