-- Function: set_updated_at
-- Sets updated_at to now() before any UPDATE. Called by triggers on all mutable tables.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach to every mutable table.
-- "before update" fires before the row is written, so new.updated_at takes effect.
create or replace trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

create or replace trigger trg_tenants_updated_at
  before update on tenants
  for each row execute function set_updated_at();

create or replace trigger trg_tenant_memberships_updated_at
  before update on tenant_memberships
  for each row execute function set_updated_at();

create or replace trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

create or replace trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

create or replace trigger trg_promotions_updated_at
  before update on promotions
  for each row execute function set_updated_at();