-- Run this in the Supabase SQL editor for your project.
-- Adds columns for tags, recurring expenses, and edit-history flagging.
alter table transactions
  add column if not exists tags text[] not null default '{}',
  add column if not exists recurring boolean not null default false,
  add column if not exists was_edited boolean not null default false;
