-- Columna opcional para incluir o excluir el protocolo de servicio en cada propuesta.
-- Solo agrega la columna; conserva intactas todas las propuestas existentes.
-- Ejecutar en Supabase SQL Editor si se desea persistencia en columna dedicada:
alter table public.propuestas add column if not exists incluir_protocolo boolean default true;
