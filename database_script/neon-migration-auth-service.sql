-- =====================================================
-- MIGRACIÓN: AUTH-SERVICE - CAMPOS PARA OAUTH (GOOGLE)
-- Descripción: Añade columnas para proveedor y ID del proveedor
-- Fecha: 2025-11-05
-- =====================================================

-- Agregar columnas para manejo de proveedores externos (OAuth)
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local' CHECK (provider IN ('local','google')),
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- Índice único para combinación provider + provider_id (evita duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_provider_id
  ON users(provider, provider_id) WHERE provider_id IS NOT NULL;

-- Índice para consultas por provider
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);

-- Opcional: Si deseas marcar verificados los emails de Google automáticamente
-- (esto ya se maneja desde el servicio, pero aquí se documenta)
-- UPDATE users SET email_verified = true WHERE provider = 'google' AND email_verified IS FALSE;

-- Nota: El esquema original ya tiene email_verified y avatar_url.
--       provider_id puede almacenar el 'sub' de Google.