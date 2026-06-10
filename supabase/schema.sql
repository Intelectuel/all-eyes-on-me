-- All Eyes On Me — Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  credits integer not null default 1000,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Markets
create table public.markets (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null default 'personal',
  resolution_date date not null,
  resolved boolean not null default false,
  resolution text check (resolution in ('YES', 'NO')),
  yes_pool integer not null default 0,
  no_pool integer not null default 0,
  created_at timestamptz default now()
);

alter table public.markets enable row level security;

create policy "Markets are viewable by everyone"
  on public.markets for select using (true);

create policy "Authenticated users can create markets"
  on public.markets for insert with check (auth.uid() = creator_id);

create policy "Creators can update their own markets"
  on public.markets for update using (auth.uid() = creator_id);

-- Bets
create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  market_id uuid references public.markets(id) on delete cascade not null,
  position text not null check (position in ('YES', 'NO')),
  amount integer not null check (amount > 0),
  created_at timestamptz default now()
);

alter table public.bets enable row level security;

create policy "Users can view their own bets"
  on public.bets for select using (auth.uid() = user_id);

create policy "Authenticated users can place bets"
  on public.bets for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Place bet function (atomic: deduct credits + insert bet + update pools)
create or replace function public.place_bet(
  p_market_id uuid,
  p_position text,
  p_amount integer
)
returns void as $$
declare
  v_user_id uuid := auth.uid();
  v_credits integer;
  v_resolved boolean;
begin
  select credits into v_credits from public.profiles where id = v_user_id;
  select resolved into v_resolved from public.markets where id = p_market_id;

  if v_credits < p_amount then
    raise exception 'Insufficient credits';
  end if;

  if v_resolved then
    raise exception 'Market is already resolved';
  end if;

  update public.profiles set credits = credits - p_amount where id = v_user_id;

  insert into public.bets (user_id, market_id, position, amount)
  values (v_user_id, p_market_id, p_position, p_amount);

  if p_position = 'YES' then
    update public.markets set yes_pool = yes_pool + p_amount where id = p_market_id;
  else
    update public.markets set no_pool = no_pool + p_amount where id = p_market_id;
  end if;
end;
$$ language plpgsql security definer;
