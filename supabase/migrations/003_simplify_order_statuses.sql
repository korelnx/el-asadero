-- Simplify order_status enum to match real POS flow:
-- New → In Progress → Ready → Done

-- Step 1: Drop policy and views that depend on the status column
drop policy if exists "Users can update own pending orders" on public.orders;
drop view if exists public.orders_summary;

-- Step 2: Convert columns to text temporarily
alter table public.orders               alter column status      type text;
alter table public.order_status_history alter column from_status type text;
alter table public.order_status_history alter column to_status   type text;

-- Step 3: Map old values → new values
update public.orders set status = 'new'         where status in ('pending', 'confirmed');
update public.orders set status = 'in_progress' where status in ('preparing', 'out_for_delivery');
update public.orders set status = 'done'        where status in ('delivered', 'picked_up');

update public.order_status_history set from_status = 'new'         where from_status in ('pending', 'confirmed');
update public.order_status_history set from_status = 'in_progress' where from_status in ('preparing', 'out_for_delivery');
update public.order_status_history set from_status = 'done'        where from_status in ('delivered', 'picked_up');

update public.order_status_history set to_status = 'new'         where to_status in ('pending', 'confirmed');
update public.order_status_history set to_status = 'in_progress' where to_status in ('preparing', 'out_for_delivery');
update public.order_status_history set to_status = 'done'        where to_status in ('delivered', 'picked_up');

-- Step 4: Drop default that references the enum, then drop the enum
alter table public.orders alter column status drop default;
drop type public.order_status;

-- Step 4: Create new simplified enum
create type public.order_status as enum (
  'new',           -- order received, kitchen hasn't started
  'in_progress',   -- kitchen is working on it
  'ready',         -- ready for pickup or handoff to driver
  'done',          -- picked up / delivered / complete
  'cancelled',     -- cancelled by customer or admin
  'payment_failed' -- stripe payment failed
);

-- Step 5: Cast columns back
alter table public.orders
  alter column status type public.order_status using status::public.order_status,
  alter column status set default 'new';

alter table public.order_status_history
  alter column from_status type public.order_status using from_status::public.order_status,
  alter column to_status   type public.order_status using to_status::public.order_status;

-- Step 7: Recreate orders_summary view
create view public.orders_summary as
select
  o.*,
  count(oi.id)::int as item_count,
  json_agg(
    json_build_object(
      'id',       oi.id,
      'name',     oi.item_name,
      'quantity', oi.quantity,
      'subtotal', oi.subtotal,
      'modifiers', (
        select json_agg(json_build_object('group', oim.group_name, 'option', oim.option_name, 'price_delta', oim.price_delta))
        from public.order_item_modifiers oim where oim.order_item_id = oi.id
      )
    )
  ) as items
from public.orders o
left join public.order_items oi on oi.order_id = o.id
group by o.id
order by o.created_at desc;

-- Step 8: Recreate RLS policy with new status name
create policy "Users can update own new orders" on public.orders for update using (
  auth.uid() = user_id and status = 'new'
);
