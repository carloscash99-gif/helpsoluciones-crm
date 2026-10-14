-- Columna opcional para almacenar puntos y textos personalizados del protocolo por propuesta.
-- Solo agrega la columna; conserva intactas todas las propuestas existentes.
-- Ejecutar en Supabase SQL Editor si se desea columna nativa:
alter table public.propuestas add column if not exists protocolo jsonb;
