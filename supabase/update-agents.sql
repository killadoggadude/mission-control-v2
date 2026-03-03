-- Update agents with correct local model
-- Run this in Supabase SQL Editor

UPDATE agents 
SET model = 'qwen3.5-9b-local'
WHERE model = 'qwen35/qwen3.5-plus';

-- Or update individual agents with specific models:
/*
UPDATE agents SET model = 'qwen3.5-9b-local' WHERE name = 'Echo';
UPDATE agents SET model = 'qwen3.5-9b-local' WHERE name = 'Vega';
UPDATE agents SET model = 'qwen3.5-9b-local' WHERE name = 'Maya';
UPDATE agents SET model = 'qwen3.5-9b-local' WHERE name = 'Mira';
UPDATE agents SET model = 'qwen3.5-9b-local' WHERE name = 'Nova';
UPDATE agents SET model = 'qwen3.5-9b-local' WHERE name = 'Blaze';
UPDATE agents SET model = 'qwen3.5-9b-local' WHERE name = 'Cosmo';
UPDATE agents SET model = 'qwen3.5-9b-local' WHERE name = 'Cleo';
*/
