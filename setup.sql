-- ================================================
--  RB Advogados — Setup do banco de dados
--  Cole este conteúdo no SQL Editor do Supabase
--  e clique em "Run"
-- ================================================

-- CLIENTES
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text,
  tel text,
  email text,
  processo text,
  tipo text,
  status text default 'Em andamento',
  municipio text,
  obs text,
  created_at timestamptz default now()
);

-- HONORÁRIOS
create table if not exists honorarios (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete set null,
  processo text,
  total numeric(12,2) default 0,
  tipo text default 'Contratual',
  data_inicio date,
  obs text,
  parcelas jsonb default '[]',
  created_at timestamptz default now()
);

-- DESPESAS
create table if not exists despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  cat text,
  valor numeric(12,2) default 0,
  data date,
  status text default 'Pendente',
  obs text,
  created_at timestamptz default now()
);

-- NOTAS
create table if not exists notas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cliente_id uuid references clientes(id) on delete set null,
  prioridade text default 'Normal',
  corpo text,
  created_at timestamptz default now()
);

-- ================================================
--  ACESSO PÚBLICO (necessário para o sistema HTML)
--  O sistema usa a chave "anon" do Supabase
-- ================================================
alter table clientes enable row level security;
alter table honorarios enable row level security;
alter table despesas enable row level security;
alter table notas enable row level security;

-- Política: acesso total via chave anon (o controle de perfis é feito no sistema)
create policy "acesso_total" on clientes for all using (true) with check (true);
create policy "acesso_total" on honorarios for all using (true) with check (true);
create policy "acesso_total" on despesas for all using (true) with check (true);
create policy "acesso_total" on notas for all using (true) with check (true);
