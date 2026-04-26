-- ============================================================================
-- ENUMS
-- ============================================================================
create type public.context_status   as enum ('draft','active','archived');
create type public.context_role     as enum ('owner','editor','viewer');
create type public.dataset_kind     as enum ('taxonomy','occupations','labor','opportunities','learning');
create type public.dataset_status   as enum ('draft','live','archived');

-- ============================================================================
-- TABLES
-- ============================================================================

-- A tenant's country/region context
create table public.contexts (
  id            uuid primary key default gen_random_uuid(),
  code          text not null,                       -- e.g. 'PK', 'KE-NRB'
  name          text not null,                       -- e.g. 'Pakistan'
  flag_emoji    text,
  locale        text not null default 'en',          -- BCP-47, e.g. 'en', 'sw', 'ur-PK'
  currency      text not null default 'USD',         -- ISO 4217
  owner_org     text,                                -- free-text org name
  status        context_status not null default 'draft',
  calibration   jsonb not null default '{}'::jsonb,  -- automation, weights, etc.
  created_by    uuid not null references auth.users(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (code)
);
create index contexts_status_idx on public.contexts(status);

-- Per-context membership
create table public.context_members (
  id          uuid primary key default gen_random_uuid(),
  context_id  uuid not null references public.contexts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        context_role not null default 'editor',
  created_at  timestamptz not null default now(),
  unique (context_id, user_id)
);
create index context_members_user_idx on public.context_members(user_id);

-- Versioned dataset per kind, per context
create table public.datasets (
  id            uuid primary key default gen_random_uuid(),
  context_id    uuid not null references public.contexts(id) on delete cascade,
  kind          dataset_kind not null,
  version       int  not null default 1,
  status        dataset_status not null default 'draft',
  notes         text,
  published_at  timestamptz,
  created_by    uuid not null references auth.users(id) on delete restrict,
  created_at    timestamptz not null default now(),
  unique (context_id, kind, version)
);
create index datasets_ctx_kind_status_idx on public.datasets(context_id, kind, status);
-- Only one live dataset per (context, kind)
create unique index datasets_one_live_per_kind on public.datasets(context_id, kind)
  where status = 'live';

-- Skill taxonomy nodes
create table public.taxonomy_skills (
  id          uuid primary key default gen_random_uuid(),
  dataset_id  uuid not null references public.datasets(id) on delete cascade,
  code        text not null,
  label       text not null,
  parent_code text,
  level       int  not null default 0,
  source      text,
  unique (dataset_id, code)
);
create index taxonomy_skills_dataset_idx on public.taxonomy_skills(dataset_id);

-- Occupations
create table public.occupations (
  id               uuid primary key default gen_random_uuid(),
  dataset_id       uuid not null references public.datasets(id) on delete cascade,
  code             text not null,
  title            text not null,
  isco_major       text,
  automation_risk  numeric(5,4),    -- 0.0000 - 1.0000
  unique (dataset_id, code)
);
create index occupations_dataset_idx on public.occupations(dataset_id);

-- Labor market indicators (ILO/WDI shape)
create table public.labor_indicators (
  id              uuid primary key default gen_random_uuid(),
  dataset_id      uuid not null references public.datasets(id) on delete cascade,
  indicator_code  text not null,
  year            int  not null,
  value           numeric,
  sex             text,             -- 'male' / 'female' / 'total'
  age_band        text,             -- '15-24' / '25-54' / etc.
  unique (dataset_id, indicator_code, year, sex, age_band)
);
create index labor_dataset_idx on public.labor_indicators(dataset_id);

-- Opportunities (jobs, internships)
create table public.opportunities (
  id          uuid primary key default gen_random_uuid(),
  dataset_id  uuid not null references public.datasets(id) on delete cascade,
  title       text not null,
  employer    text,
  sector      text,
  skills      text[] not null default '{}',
  region      text,
  remote      boolean not null default false,
  url         text
);
create index opportunities_dataset_idx on public.opportunities(dataset_id);

-- Learning resources
create table public.learning_resources (
  id          uuid primary key default gen_random_uuid(),
  dataset_id  uuid not null references public.datasets(id) on delete cascade,
  title       text not null,
  provider    text,
  skill_codes text[] not null default '{}',
  duration_h  numeric,
  language    text,
  cost        numeric,
  url         text
);
create index learning_dataset_idx on public.learning_resources(dataset_id);

-- Ingestion audit log
create table public.ingestion_runs (
  id           uuid primary key default gen_random_uuid(),
  context_id   uuid not null references public.contexts(id) on delete cascade,
  dataset_id   uuid references public.datasets(id) on delete set null,
  kind         dataset_kind not null,
  file_name    text,
  rows_in      int  not null default 0,
  rows_ok      int  not null default 0,
  rows_err     int  not null default 0,
  errors       jsonb not null default '[]'::jsonb,
  actor_id     uuid not null references auth.users(id) on delete restrict,
  created_at   timestamptz not null default now()
);
create index ingestion_runs_ctx_idx on public.ingestion_runs(context_id, created_at desc);

-- ============================================================================
-- HELPER FUNCTIONS (security definer to avoid RLS recursion)
-- ============================================================================

-- Is the user a member of this context (any role)?
create or replace function public.is_context_member(_user_id uuid, _context_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.context_members
    where user_id = _user_id and context_id = _context_id
  );
$$;

-- Can the user edit this context (owner or editor)?
create or replace function public.can_edit_context(_user_id uuid, _context_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.context_members
    where user_id = _user_id
      and context_id = _context_id
      and role in ('owner','editor')
  );
$$;

-- Resolve a dataset's context_id (used by child-table policies)
create or replace function public.dataset_context(_dataset_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select context_id from public.datasets where id = _dataset_id;
$$;

-- Trigger: keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contexts_touch_updated_at
  before update on public.contexts
  for each row execute function public.touch_updated_at();

-- Trigger: when a context is created, add the creator as owner
create or replace function public.add_context_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.context_members (context_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (context_id, user_id) do nothing;
  return new;
end;
$$;

create trigger contexts_add_owner
  after insert on public.contexts
  for each row execute function public.add_context_owner();

-- Trigger: enforce single live dataset per (context, kind)
-- The unique partial index already guarantees this; we add a friendlier error.
create or replace function public.demote_previous_live()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'live' and (old.status is distinct from 'live') then
    update public.datasets
       set status = 'archived'
     where context_id = new.context_id
       and kind       = new.kind
       and id        <> new.id
       and status     = 'live';
    new.published_at = coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

create trigger datasets_demote_previous_live
  before update on public.datasets
  for each row execute function public.demote_previous_live();

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.contexts           enable row level security;
alter table public.context_members    enable row level security;
alter table public.datasets           enable row level security;
alter table public.taxonomy_skills    enable row level security;
alter table public.occupations        enable row level security;
alter table public.labor_indicators   enable row level security;
alter table public.opportunities      enable row level security;
alter table public.learning_resources enable row level security;
alter table public.ingestion_runs     enable row level security;

-- ----- contexts -----
create policy "Public can view active contexts"
  on public.contexts for select
  using (status = 'active');

create policy "Members can view their contexts"
  on public.contexts for select to authenticated
  using (public.is_context_member(auth.uid(), id) or public.has_role(auth.uid(), 'admin'));

create policy "Authenticated users can create contexts"
  on public.contexts for insert to authenticated
  with check (auth.uid() = created_by);

create policy "Editors can update their contexts"
  on public.contexts for update to authenticated
  using (public.can_edit_context(auth.uid(), id) or public.has_role(auth.uid(), 'admin'))
  with check (public.can_edit_context(auth.uid(), id) or public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete contexts"
  on public.contexts for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- ----- context_members -----
create policy "Members can view their own membership rows"
  on public.context_members for select to authenticated
  using (user_id = auth.uid()
         or public.can_edit_context(auth.uid(), context_id)
         or public.has_role(auth.uid(), 'admin'));

create policy "Owners and admins can add members"
  on public.context_members for insert to authenticated
  with check (
    public.has_role(auth.uid(), 'admin') or exists (
      select 1 from public.context_members m
      where m.context_id = context_members.context_id
        and m.user_id    = auth.uid()
        and m.role       = 'owner'
    )
  );

create policy "Owners and admins can update members"
  on public.context_members for update to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or exists (
      select 1 from public.context_members m
      where m.context_id = context_members.context_id
        and m.user_id    = auth.uid()
        and m.role       = 'owner'
    )
  );

create policy "Owners and admins can remove members"
  on public.context_members for delete to authenticated
  using (
    public.has_role(auth.uid(), 'admin') or exists (
      select 1 from public.context_members m
      where m.context_id = context_members.context_id
        and m.user_id    = auth.uid()
        and m.role       = 'owner'
    )
  );

-- ----- datasets -----
create policy "Public can view live datasets in active contexts"
  on public.datasets for select
  using (
    status = 'live' and exists (
      select 1 from public.contexts c
      where c.id = datasets.context_id and c.status = 'active'
    )
  );

create policy "Members can view all datasets in their contexts"
  on public.datasets for select to authenticated
  using (public.is_context_member(auth.uid(), context_id) or public.has_role(auth.uid(), 'admin'));

create policy "Editors can create datasets"
  on public.datasets for insert to authenticated
  with check (
    auth.uid() = created_by and (
      public.can_edit_context(auth.uid(), context_id)
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Editors can update datasets"
  on public.datasets for update to authenticated
  using (public.can_edit_context(auth.uid(), context_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.can_edit_context(auth.uid(), context_id) or public.has_role(auth.uid(), 'admin'));

create policy "Editors can delete draft datasets"
  on public.datasets for delete to authenticated
  using (
    status = 'draft'
    and (public.can_edit_context(auth.uid(), context_id) or public.has_role(auth.uid(), 'admin'))
  );

-- ----- generic per-dataset child-table policy generator (inline) -----
-- We repeat the same 5 policies for each child table.

-- taxonomy_skills
create policy "Public reads live taxonomy"
  on public.taxonomy_skills for select
  using (exists (
    select 1 from public.datasets d join public.contexts c on c.id = d.context_id
    where d.id = taxonomy_skills.dataset_id and d.status = 'live' and c.status = 'active'
  ));
create policy "Members read taxonomy in their contexts"
  on public.taxonomy_skills for select to authenticated
  using (public.is_context_member(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'));
create policy "Editors write taxonomy"
  on public.taxonomy_skills for all to authenticated
  using (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'))
  with check (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
              or public.has_role(auth.uid(), 'admin'));

-- occupations
create policy "Public reads live occupations"
  on public.occupations for select
  using (exists (
    select 1 from public.datasets d join public.contexts c on c.id = d.context_id
    where d.id = occupations.dataset_id and d.status = 'live' and c.status = 'active'
  ));
create policy "Members read occupations in their contexts"
  on public.occupations for select to authenticated
  using (public.is_context_member(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'));
create policy "Editors write occupations"
  on public.occupations for all to authenticated
  using (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'))
  with check (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
              or public.has_role(auth.uid(), 'admin'));

-- labor_indicators
create policy "Public reads live labor"
  on public.labor_indicators for select
  using (exists (
    select 1 from public.datasets d join public.contexts c on c.id = d.context_id
    where d.id = labor_indicators.dataset_id and d.status = 'live' and c.status = 'active'
  ));
create policy "Members read labor in their contexts"
  on public.labor_indicators for select to authenticated
  using (public.is_context_member(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'));
create policy "Editors write labor"
  on public.labor_indicators for all to authenticated
  using (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'))
  with check (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
              or public.has_role(auth.uid(), 'admin'));

-- opportunities
create policy "Public reads live opportunities"
  on public.opportunities for select
  using (exists (
    select 1 from public.datasets d join public.contexts c on c.id = d.context_id
    where d.id = opportunities.dataset_id and d.status = 'live' and c.status = 'active'
  ));
create policy "Members read opportunities in their contexts"
  on public.opportunities for select to authenticated
  using (public.is_context_member(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'));
create policy "Editors write opportunities"
  on public.opportunities for all to authenticated
  using (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'))
  with check (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
              or public.has_role(auth.uid(), 'admin'));

-- learning_resources
create policy "Public reads live learning"
  on public.learning_resources for select
  using (exists (
    select 1 from public.datasets d join public.contexts c on c.id = d.context_id
    where d.id = learning_resources.dataset_id and d.status = 'live' and c.status = 'active'
  ));
create policy "Members read learning in their contexts"
  on public.learning_resources for select to authenticated
  using (public.is_context_member(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'));
create policy "Editors write learning"
  on public.learning_resources for all to authenticated
  using (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
         or public.has_role(auth.uid(), 'admin'))
  with check (public.can_edit_context(auth.uid(), public.dataset_context(dataset_id))
              or public.has_role(auth.uid(), 'admin'));

-- ingestion_runs
create policy "Members view audit log for their contexts"
  on public.ingestion_runs for select to authenticated
  using (public.is_context_member(auth.uid(), context_id) or public.has_role(auth.uid(), 'admin'));

create policy "Editors append audit log"
  on public.ingestion_runs for insert to authenticated
  with check (
    auth.uid() = actor_id and (
      public.can_edit_context(auth.uid(), context_id) or public.has_role(auth.uid(), 'admin')
    )
  );