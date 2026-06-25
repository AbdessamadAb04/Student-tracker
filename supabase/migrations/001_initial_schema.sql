-- ============================================================
-- EduTrack — Full Schema Migration
-- Run this in Supabase SQL Editor to create all tables + policies
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  institution text,
  year        text,
  track       text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles: own read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── SUBJECTS ────────────────────────────────────────────────────────────────

create table if not exists public.subjects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#065f46',
  type        text not null check (type in ('academic', 'personal')),
  coefficient numeric,
  teacher     text,
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

create index if not exists subjects_user_id_idx on public.subjects(user_id);
alter table public.subjects enable row level security;
create policy "subjects: own all"    on public.subjects using (auth.uid() = user_id);
create policy "subjects: own insert" on public.subjects for insert with check (auth.uid() = user_id);

-- ─── GRADES ──────────────────────────────────────────────────────────────────

create table if not exists public.grades (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title      text not null,
  value      numeric not null check (value between 0 and 20),
  weight     numeric not null default 1,
  date       date not null,
  teacher    text not null,
  type       text not null check (type in ('exam','tp','cc','project','quiz')),
  created_at timestamptz default now()
);

create index if not exists grades_user_id_idx on public.grades(user_id);
alter table public.grades enable row level security;
create policy "grades: own all"    on public.grades using (auth.uid() = user_id);
create policy "grades: own insert" on public.grades for insert with check (auth.uid() = user_id);

-- ─── ABSENCES ────────────────────────────────────────────────────────────────

create table if not exists public.absences (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  subject_id           uuid references public.subjects(id) on delete set null,
  date                 date not null,
  duration             text not null check (duration in ('half','full')),
  reason               text,
  excused              boolean not null default false,
  certificate_provided boolean not null default false,
  created_at           timestamptz default now()
);

create index if not exists absences_user_id_idx on public.absences(user_id);
alter table public.absences enable row level security;
create policy "absences: own all"    on public.absences using (auth.uid() = user_id);
create policy "absences: own insert" on public.absences for insert with check (auth.uid() = user_id);

-- ─── FEEDBACKS ───────────────────────────────────────────────────────────────

create table if not exists public.feedbacks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  teacher_name text not null,
  subject_id   uuid not null references public.subjects(id) on delete cascade,
  comment      text not null,
  rating       integer not null check (rating between 1 and 5),
  is_positive  boolean not null default true,
  date         date not null,
  created_at   timestamptz default now()
);

create index if not exists feedbacks_user_id_idx on public.feedbacks(user_id);
alter table public.feedbacks enable row level security;
create policy "feedbacks: own all"    on public.feedbacks using (auth.uid() = user_id);
create policy "feedbacks: own insert" on public.feedbacks for insert with check (auth.uid() = user_id);

-- ─── TASKS ───────────────────────────────────────────────────────────────────

create table if not exists public.tasks (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  type               text not null default 'simple' check (type in ('simple','complex')),
  title              text not null,
  description        text not null default '',
  category           text not null default 'study',
  created_by         text not null default 'student' check (created_by in ('student','teacher','system')),
  due_date           date not null,
  priority           text not null default 'medium' check (priority in ('low','medium','high')),
  status             text not null default 'pending',
  estimated_hours    numeric not null default 1,
  actual_hours       numeric,
  subject_ids        text[] default '{}',
  tags               text[] default '{}',
  started_date       timestamptz,
  completed_date     timestamptz,
  completion_quality integer,
  learning_gain      integer,
  grade              numeric,
  notes              text,
  created_at         timestamptz default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
alter table public.tasks enable row level security;
create policy "tasks: own all"    on public.tasks using (auth.uid() = user_id);
create policy "tasks: own insert" on public.tasks for insert with check (auth.uid() = user_id);

-- ─── STUDY SESSIONS ──────────────────────────────────────────────────────────

create table if not exists public.study_sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  subject_id       uuid references public.subjects(id) on delete set null,
  task_id          uuid references public.tasks(id) on delete set null,
  start_time       timestamptz not null,
  end_time         timestamptz,
  duration_minutes integer not null,
  notes            text,
  quality          integer check (quality between 1 and 5),
  created_at       timestamptz default now()
);

create index if not exists study_sessions_user_id_idx on public.study_sessions(user_id);
alter table public.study_sessions enable row level security;
create policy "study_sessions: own all"    on public.study_sessions using (auth.uid() = user_id);
create policy "study_sessions: own insert" on public.study_sessions for insert with check (auth.uid() = user_id);

-- ─── REFLECTIONS ─────────────────────────────────────────────────────────────

create table if not exists public.reflections (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  date                 date not null,
  subject_id           uuid references public.subjects(id) on delete set null,
  hours_studied        numeric not null default 0,
  sessions_count       integer not null default 0,
  avg_session_minutes  integer not null default 0,
  tasks_completed      integer not null default 0,
  study_consistency    integer not null default 5 check (study_consistency between 1 and 10),
  concentration_level  integer not null default 5 check (concentration_level between 1 and 10),
  distractions_count   integer not null default 0,
  progress_satisfaction integer not null default 5 check (progress_satisfaction between 1 and 10),
  confidence_level     integer not null default 5 check (confidence_level between 1 and 10),
  motivation_level     integer not null default 5 check (motivation_level between 1 and 10),
  self_assessed_mastery integer not null default 5 check (self_assessed_mastery between 1 and 10),
  perceived_difficulty  integer not null default 5 check (perceived_difficulty between 1 and 10),
  notes                text,
  created_at           timestamptz default now()
);

create index if not exists reflections_user_id_idx on public.reflections(user_id);
alter table public.reflections enable row level security;
create policy "reflections: own all"    on public.reflections using (auth.uid() = user_id);
create policy "reflections: own insert" on public.reflections for insert with check (auth.uid() = user_id);
