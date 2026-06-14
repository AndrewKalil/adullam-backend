-- Enable RLS. A table with RLS enabled and no matching policy refuses everything.
alter table categories         enable row level security;
alter table products           enable row level security;
alter table discounts          enable row level security;
alter table discount_products  enable row level security;
alter table promo_codes        enable row level security;
alter table tenant_memberships enable row level security;

-- Grant table-level permissions to the authenticated role.
-- RLS policies control which rows are visible/writable — but Postgres still
-- requires an explicit GRANT for the role to touch the table at all.
grant select, insert, update, delete on categories        to authenticated;
grant select, insert, update, delete on products          to authenticated;
grant select, insert, update, delete on discounts         to authenticated;
grant select, insert, delete         on discount_products to authenticated;
grant select, insert, update, delete on promo_codes       to authenticated;
grant select, insert, update, delete on tenant_memberships to authenticated;
grant insert                          on logs              to authenticated;

-- Helper: checks that the current user has an active membership in the current tenant.
-- Extracted as a function to avoid repeating the subquery in every policy.
create or replace function current_user_is_tenant_member(p_tenant_id uuid)
returns boolean as $$
  select exists (
    select 1 from tenant_memberships
    where tenant_id = p_tenant_id
      and user_id = nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
      and deleted_at is null
  )
$$ language sql stable security definer;

-- Categories policy
drop policy if exists categories_tenant_isolation on categories;
create policy categories_tenant_isolation on categories
for all
using (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
)
with check (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
);

-- Products policy
drop policy if exists products_tenant_isolation on products;
create policy products_tenant_isolation on products
for all
using (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
)
with check (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
);

-- Discounts policy
drop policy if exists discounts_tenant_isolation on discounts;
create policy discounts_tenant_isolation on discounts
for all
using (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
)
with check (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
);

-- Discount products policy
drop policy if exists discount_products_tenant_isolation on discount_products;
create policy discount_products_tenant_isolation on discount_products
for all
using (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
)
with check (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
);

-- Promo codes policy
drop policy if exists promo_codes_tenant_isolation on promo_codes;
create policy promo_codes_tenant_isolation on promo_codes
for all
using (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
)
with check (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
);

-- Tenant memberships: users can only see memberships for the current tenant
drop policy if exists memberships_tenant_isolation on tenant_memberships;
create policy memberships_tenant_isolation on tenant_memberships
for all
using (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
)
with check (
  tenant_id = nullif(current_setting('app.current_tenant', true), '')::uuid
  and current_user_is_tenant_member(tenant_id)
);
