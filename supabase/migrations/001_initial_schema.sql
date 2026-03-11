-- ============================================================
-- African Paradise Restaurant — Initial Schema
-- ============================================================
-- Run this in the Supabase SQL editor or via supabase db push

-- ─── Extensions ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for full-text menu search

-- ─── Profiles ───────────────────────────────────────────────
-- Extends auth.users. Created automatically via trigger on signup.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ─── Restaurant Settings ─────────────────────────────────────
-- Key-value store for runtime config (editable from admin dashboard)
create table public.restaurant_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now()
);

create trigger restaurant_settings_updated_at
  before update on public.restaurant_settings
  for each row execute procedure public.set_updated_at();

-- Seed default settings
insert into public.restaurant_settings (key, value, description) values
  ('is_accepting_orders', 'true',        'Toggle online ordering on/off'),
  ('delivery_fee',        '4.99',        'Delivery fee in dollars'),
  ('min_order_delivery',  '15.00',       'Minimum order amount for delivery'),
  ('min_order_pickup',    '0',           'Minimum order amount for pickup'),
  ('tax_rate',            '0.0875',      'Tax rate (e.g. 0.0875 = 8.75%)'),
  ('estimated_pickup_min','15',          'Estimated pickup time in minutes'),
  ('estimated_delivery_min','35',        'Estimated delivery time in minutes'),
  ('max_delivery_radius_miles','10',     'Max delivery radius in miles'),
  ('restaurant_name',     '"African Paradise"', 'Restaurant display name'),
  ('restaurant_phone',    '"+1 (555) 123-4567"', 'Restaurant phone number'),
  ('restaurant_address',  '{"street":"123 Savanna Street","city":"City Center","state":"CA","zip":"90210"}', 'Restaurant address'),
  ('business_hours', '{
    "monday":    {"open":"09:00","close":"22:00","closed":false},
    "tuesday":   {"open":"09:00","close":"22:00","closed":false},
    "wednesday": {"open":"09:00","close":"22:00","closed":false},
    "thursday":  {"open":"09:00","close":"22:00","closed":false},
    "friday":    {"open":"09:00","close":"23:00","closed":false},
    "saturday":  {"open":"10:00","close":"23:00","closed":false},
    "sunday":    {"open":"10:00","close":"21:00","closed":false}
  }', 'Weekly business hours');

-- ─── Categories ──────────────────────────────────────────────
create table public.categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  image_url     text,
  display_order int  not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger categories_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

-- ─── Menu Items ──────────────────────────────────────────────
create table public.menu_items (
  id              uuid primary key default uuid_generate_v4(),
  category_id     uuid not null references public.categories(id) on delete restrict,
  name            text not null,
  description     text,
  price           numeric(10,2) not null check (price >= 0),
  image_url       text,          -- Supabase Storage public URL
  image_path      text,          -- Supabase Storage path (for deletion)
  is_available    boolean not null default true,
  is_featured     boolean not null default false,
  display_order   int  not null default 0,
  -- Nutritional / allergy info (optional, extensible)
  tags            text[] default '{}', -- e.g. ['halal','vegetarian','spicy']
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index menu_items_category_idx on public.menu_items(category_id);
create index menu_items_available_idx on public.menu_items(is_available);
create index menu_items_name_trgm_idx on public.menu_items using gin (name gin_trgm_ops);

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute procedure public.set_updated_at();

-- ─── Modifier Groups ─────────────────────────────────────────
-- e.g. "Spice Level", "Protein Choice", "Add-ons", "Size"
create table public.modifier_groups (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  description      text,
  selection_type   text not null default 'single' check (selection_type in ('single', 'multiple')),
  is_required      boolean not null default false,
  min_selections   int not null default 0,
  max_selections   int,          -- null = unlimited for multiple
  display_order    int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger modifier_groups_updated_at
  before update on public.modifier_groups
  for each row execute procedure public.set_updated_at();

-- ─── Modifier Options ────────────────────────────────────────
-- Individual choices within a modifier group
create table public.modifier_options (
  id                  uuid primary key default uuid_generate_v4(),
  modifier_group_id   uuid not null references public.modifier_groups(id) on delete cascade,
  name                text not null,
  price_delta         numeric(10,2) not null default 0, -- added to item price (0 = free)
  is_default          boolean not null default false,
  is_available        boolean not null default true,
  display_order       int not null default 0,
  created_at          timestamptz not null default now()
);

create index modifier_options_group_idx on public.modifier_options(modifier_group_id);

-- ─── Menu Item → Modifier Groups (junction) ──────────────────
create table public.menu_item_modifier_groups (
  menu_item_id        uuid not null references public.menu_items(id) on delete cascade,
  modifier_group_id   uuid not null references public.modifier_groups(id) on delete cascade,
  display_order       int not null default 0,
  primary key (menu_item_id, modifier_group_id)
);

create index mimgs_item_idx  on public.menu_item_modifier_groups(menu_item_id);
create index mimgs_group_idx on public.menu_item_modifier_groups(modifier_group_id);

-- ─── Orders ──────────────────────────────────────────────────
create type public.order_status as enum (
  'pending',           -- created, awaiting payment
  'payment_failed',    -- stripe payment failed
  'confirmed',         -- payment succeeded / cash order accepted
  'preparing',         -- kitchen is working on it
  'ready',             -- ready for pickup or out for delivery
  'out_for_delivery',  -- driver on the way
  'delivered',         -- completed delivery
  'picked_up',         -- completed pickup
  'cancelled'          -- cancelled by customer or admin
);

create type public.order_type as enum ('delivery', 'pickup');
create type public.payment_method as enum ('stripe', 'cash');

create table public.orders (
  id                        uuid primary key default uuid_generate_v4(),
  order_number              text not null unique, -- human-readable e.g. AP-1042
  user_id                   uuid references auth.users(id) on delete set null, -- null = guest
  status                    public.order_status not null default 'pending',
  type                      public.order_type not null,

  -- Customer info (denormalized — works for guests too)
  customer_name             text not null,
  customer_email            text not null,
  customer_phone            text not null,

  -- Delivery address (null for pickup)
  delivery_address          jsonb, -- {street, city, state, zip, unit?, instructions?}

  -- Pricing (all in dollars, stored as-calculated at order time)
  subtotal                  numeric(10,2) not null,
  delivery_fee              numeric(10,2) not null default 0,
  tax                       numeric(10,2) not null default 0,
  tip                       numeric(10,2) not null default 0,
  total                     numeric(10,2) not null,

  -- Payment
  payment_method            public.payment_method not null,
  stripe_payment_intent_id  text unique,
  stripe_payment_status     text,                -- e.g. 'succeeded', 'requires_payment_method'

  -- Metadata
  special_instructions      text,
  estimated_ready_at        timestamptz,
  admin_notes               text,               -- internal notes for kitchen/staff

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Auto-generate order_number: AP-YYYY-NNNNN (sequential per year)
create sequence public.order_number_seq start 1000;

create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number := 'AP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  return new;
end;
$$;

create trigger orders_generate_number
  before insert on public.orders
  for each row execute procedure public.generate_order_number();

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create index orders_user_idx        on public.orders(user_id);
create index orders_status_idx      on public.orders(status);
create index orders_created_at_idx  on public.orders(created_at desc);
create index orders_email_idx       on public.orders(customer_email);

-- ─── Order Items ─────────────────────────────────────────────
-- Snapshot of what was ordered (denormalized so menu changes don't break history)
create table public.order_items (
  id                  uuid primary key default uuid_generate_v4(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  menu_item_id        uuid references public.menu_items(id) on delete set null, -- nullable: item may be deleted later
  -- Snapshot at time of order:
  item_name           text not null,
  item_description    text,
  base_price          numeric(10,2) not null,
  quantity            int not null check (quantity > 0),
  unit_price          numeric(10,2) not null, -- base_price + sum of modifier price_deltas
  subtotal            numeric(10,2) not null, -- unit_price * quantity
  special_instructions text,
  created_at          timestamptz not null default now()
);

create index order_items_order_idx on public.order_items(order_id);

-- ─── Order Item Modifiers ────────────────────────────────────
-- Which modifier options were selected for each order item (also snapshotted)
create table public.order_item_modifiers (
  id                    uuid primary key default uuid_generate_v4(),
  order_item_id         uuid not null references public.order_items(id) on delete cascade,
  modifier_option_id    uuid references public.modifier_options(id) on delete set null,
  -- Snapshot at time of order:
  group_name            text not null,
  option_name           text not null,
  price_delta           numeric(10,2) not null default 0
);

create index order_item_modifiers_item_idx on public.order_item_modifiers(order_item_id);

-- ─── Order Status History ────────────────────────────────────
-- Audit trail of every status change (useful for tracking + analytics)
create table public.order_status_history (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status   public.order_status not null,
  changed_by  uuid references auth.users(id) on delete set null, -- null = system/webhook
  note        text,
  created_at  timestamptz not null default now()
);

create index order_status_history_order_idx on public.order_status_history(order_id);

-- Auto-log status changes
create or replace function public.log_order_status_change()
returns trigger language plpgsql as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_status_history (order_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger orders_status_history
  after update on public.orders
  for each row execute procedure public.log_order_status_change();

-- ─── Row Level Security ──────────────────────────────────────

alter table public.profiles                  enable row level security;
alter table public.restaurant_settings       enable row level security;
alter table public.categories                enable row level security;
alter table public.menu_items                enable row level security;
alter table public.modifier_groups           enable row level security;
alter table public.modifier_options          enable row level security;
alter table public.menu_item_modifier_groups enable row level security;
alter table public.orders                    enable row level security;
alter table public.order_items               enable row level security;
alter table public.order_item_modifiers      enable row level security;
alter table public.order_status_history      enable row level security;

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- restaurant_settings (public read, admin write)
create policy "Public can read settings"     on public.restaurant_settings for select using (true);
create policy "Admins can manage settings"   on public.restaurant_settings for all using (public.is_admin());

-- categories (public read, admin write)
create policy "Public can read categories"   on public.categories for select using (is_active = true);
create policy "Admins can manage categories" on public.categories for all using (public.is_admin());

-- menu_items (public read available items, admin can see all)
create policy "Public can read available items" on public.menu_items for select using (is_available = true);
create policy "Admins can manage menu items"    on public.menu_items for all using (public.is_admin());

-- modifier_groups (public read)
create policy "Public can read modifier groups" on public.modifier_groups for select using (true);
create policy "Admins can manage modifier groups" on public.modifier_groups for all using (public.is_admin());

-- modifier_options (public read)
create policy "Public can read modifier options" on public.modifier_options for select using (true);
create policy "Admins can manage modifier options" on public.modifier_options for all using (public.is_admin());

-- menu_item_modifier_groups (public read)
create policy "Public can read item modifier groups" on public.menu_item_modifier_groups for select using (true);
create policy "Admins can manage item modifier groups" on public.menu_item_modifier_groups for all using (public.is_admin());

-- orders
create policy "Users can view own orders"    on public.orders for select using (
  auth.uid() = user_id or customer_email = (select email from auth.users where id = auth.uid())
);
create policy "Anyone can create orders"     on public.orders for insert with check (true); -- guest checkout allowed
create policy "Users can update own pending orders" on public.orders for update using (
  auth.uid() = user_id and status = 'pending'
);
create policy "Admins can manage all orders" on public.orders for all using (public.is_admin());

-- order_items
create policy "Users can view own order items" on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
    and (o.user_id = auth.uid() or o.customer_email = (select email from auth.users where id = auth.uid()))
  )
);
create policy "Anyone can insert order items" on public.order_items for insert with check (true);
create policy "Admins can manage order items" on public.order_items for all using (public.is_admin());

-- order_item_modifiers
create policy "Users can view own order modifiers" on public.order_item_modifiers for select using (
  exists (
    select 1 from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.id = order_item_id
    and (o.user_id = auth.uid() or o.customer_email = (select email from auth.users where id = auth.uid()))
  )
);
create policy "Anyone can insert order modifiers" on public.order_item_modifiers for insert with check (true);
create policy "Admins can manage order modifiers" on public.order_item_modifiers for all using (public.is_admin());

-- order_status_history
create policy "Users can view own order history" on public.order_status_history for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
    and (o.user_id = auth.uid() or o.customer_email = (select email from auth.users where id = auth.uid()))
  )
);
create policy "Admins can view all order history" on public.order_status_history for select using (public.is_admin());
create policy "System can insert status history"  on public.order_status_history for insert with check (true);

-- ─── Supabase Storage Buckets ────────────────────────────────
-- Run these separately in the Storage section or via this SQL:

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,                    -- publicly accessible URLs
  5242880,                 -- 5MB max per file
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Storage RLS: anyone can read, only admins can upload/delete
create policy "Public can read menu images"
  on storage.objects for select
  using (bucket_id = 'menu-images');

create policy "Admins can upload menu images"
  on storage.objects for insert
  with check (bucket_id = 'menu-images' and public.is_admin());

create policy "Admins can update menu images"
  on storage.objects for update
  using (bucket_id = 'menu-images' and public.is_admin());

create policy "Admins can delete menu images"
  on storage.objects for delete
  using (bucket_id = 'menu-images' and public.is_admin());

-- ─── Useful Views ────────────────────────────────────────────

-- Full menu with categories and modifier groups (used by storefront)
create view public.menu_with_modifiers as
select
  mi.id,
  mi.name,
  mi.description,
  mi.price,
  mi.image_url,
  mi.is_available,
  mi.is_featured,
  mi.display_order,
  mi.tags,
  c.id   as category_id,
  c.name as category_name,
  c.display_order as category_order,
  coalesce(
    json_agg(
      json_build_object(
        'id',             mg.id,
        'name',           mg.name,
        'description',    mg.description,
        'selection_type', mg.selection_type,
        'is_required',    mg.is_required,
        'min_selections', mg.min_selections,
        'max_selections', mg.max_selections,
        'display_order',  mimg.display_order,
        'options', (
          select json_agg(
            json_build_object(
              'id',            mo.id,
              'name',          mo.name,
              'price_delta',   mo.price_delta,
              'is_default',    mo.is_default,
              'is_available',  mo.is_available,
              'display_order', mo.display_order
            ) order by mo.display_order
          )
          from public.modifier_options mo
          where mo.modifier_group_id = mg.id and mo.is_available = true
        )
      ) order by mimg.display_order
    ) filter (where mg.id is not null),
    '[]'
  ) as modifier_groups
from public.menu_items mi
join public.categories c on c.id = mi.category_id
left join public.menu_item_modifier_groups mimg on mimg.menu_item_id = mi.id
left join public.modifier_groups mg on mg.id = mimg.modifier_group_id
where mi.is_available = true and c.is_active = true
group by mi.id, c.id, c.name, c.display_order
order by c.display_order, mi.display_order;

-- Order summary view for admin dashboard
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

-- ─── Functions for Admin Dashboard Analytics ─────────────────

-- Daily revenue summary
create or replace function public.get_revenue_summary(
  start_date date default current_date - 30,
  end_date   date default current_date
)
returns table (
  date            date,
  order_count     bigint,
  gross_revenue   numeric,
  avg_order_value numeric
) language sql security definer as $$
  select
    date_trunc('day', created_at)::date as date,
    count(*) as order_count,
    sum(total) as gross_revenue,
    round(avg(total), 2) as avg_order_value
  from public.orders
  where
    created_at::date between start_date and end_date
    and status not in ('cancelled', 'payment_failed')
  group by 1
  order by 1;
$$;

-- Top selling items
create or replace function public.get_top_items(limit_count int default 10)
returns table (
  menu_item_id  uuid,
  item_name     text,
  total_qty     bigint,
  total_revenue numeric
) language sql security definer as $$
  select
    oi.menu_item_id,
    oi.item_name,
    sum(oi.quantity) as total_qty,
    sum(oi.subtotal) as total_revenue
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.status not in ('cancelled', 'payment_failed')
  group by oi.menu_item_id, oi.item_name
  order by total_qty desc
  limit limit_count;
$$;
