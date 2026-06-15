-- Function: audit_log
-- Reads the current actor and tenant from Postgres session variables
-- (set by withTenant in the application layer), then inserts a row into logs.
--
-- Soft delete detection: if updated_at changed and deleted_at went from NULL to non-NULL,
-- we treat this as a "delete" action rather than "update".
--
-- Runs AFTER INSERT OR UPDATE OR DELETE so it sees the final committed values.
-- Because it runs inside the same transaction, the log entry rolls back if the
-- data change rolls back — you never log something that did not happen.

create or replace function audit_log()
returns trigger as $$
declare
  v_actor    uuid;
  v_tenant   uuid;
  v_action   text;
  v_entity_id uuid;
  v_body     jsonb;
begin
  -- current_setting with true returns '' instead of throwing if not set
  v_actor  := nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
  v_tenant := nullif(current_setting('app.current_tenant', true), '')::uuid;

  if (tg_op = 'INSERT') then
    v_action    := 'create';
    v_entity_id := new.id;
    v_body      := jsonb_build_object('new', to_jsonb(new));

  elsif (tg_op = 'UPDATE') then
    -- Soft delete: deleted_at went from NULL to a value
    if (old.deleted_at is null and new.deleted_at is not null) then
      v_action := 'delete';
    else
      v_action := 'update';
    end if;
    v_entity_id := new.id;
    v_body      := jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new));

  else -- DELETE (hard delete — should not happen on the request path, but handled defensively)
    v_action    := 'delete';
    v_entity_id := old.id;
    v_body      := jsonb_build_object('old', to_jsonb(old));
  end if;

  insert into logs (tenant_id, user_id, entity_type, entity_id, action, body)
  values (v_tenant, v_actor, tg_table_name, v_entity_id, v_action, v_body);

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Attach to audited tables.
create or replace trigger trg_categories_audit
  after insert or update or delete on categories
  for each row execute function audit_log();

create or replace trigger trg_products_audit
  after insert or update or delete on products
  for each row execute function audit_log();

create or replace trigger trg_discounts_audit
  after insert or update or delete on discounts
  for each row execute function audit_log();

create or replace trigger trg_promo_codes_audit
  after insert or update or delete on promo_codes
  for each row execute function audit_log();
