-- HomiePay Supabase Database Setup
-- ─────────────────────────────────────────────────────────────────────────────
-- This script sets up a secure, multi-user relational database for HomiePay.
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create Users Table (Username, Password, and Security Question-based)
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  username text not null unique,
  password_hash text not null,          -- SHA-256 hashed client-side for maximum security
  full_name text not null,
  security_question text,               -- One of the 6 predefined recovery questions
  security_answer_hash text,            -- SHA-256 hash of the answer (case-insensitive)
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Bills Table (Associated with a user and optionally a group)
create table if not exists public.bills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade,
  description text not null,
  amount double precision not null,
  payer_id text not null,
  splits jsonb not null default '{}'::jsonb,   -- Share breakups
  payments jsonb not null default '{}'::jsonb, -- Individual payments contributed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Indexes for High Performance Querying
create index if not exists idx_users_username on public.users(username);
create index if not exists idx_groups_user_id on public.groups(user_id);
create index if not exists idx_bills_user_id on public.bills(user_id);
