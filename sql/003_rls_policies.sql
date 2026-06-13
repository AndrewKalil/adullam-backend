-- Enable RLS. A table with RLS enabled and no matching policy refuses everything.
alter table categories         enable row level security;
alter table products           enable row level security;
alter table promotions         enable row level security;
alter table tenant_memberships enable row level security;

-- Grant table-level permissions to the authenticated role.
-- RLS policies control which rows are visible/writable — but Postgres still
-- requires an explicit GRANT for the role to touch the table at all.
grant select, insert, update, delete on categories         to authenticated;
grant select, insert, update, delete on products           to authenticated;
grant select, insert, update, delete on promotions         to authenticated;
grant select, insert, update, delete on tenant_memberships to authenticated;

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

-- Promotions policy
drop policy if exists promotions_tenant_isolation on promotions;
create policy promotions_tenant_isolation on promotions
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