-- Script para agregar la columna 'categoria' a la tabla 'clientes' en Supabase
-- Ejecuta este comando en el Editor SQL de tu proyecto Supabase:
-- https://supabase.com/dashboard/project/matyjysinegbibdwzhoq/sql/new

ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'A';

-- Opcional: Actualizar registros existentes que puedan tener null
UPDATE public.clientes 
SET categoria = 'A' 
WHERE categoria IS NULL;
