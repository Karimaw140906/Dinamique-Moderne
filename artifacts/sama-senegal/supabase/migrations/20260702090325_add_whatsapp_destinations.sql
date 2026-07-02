-- Aligne la table destinations sur le même contrat de données que
-- hotels / restaurants / transport / activities (whatsapp + traçabilité créateur)
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS created_by_role text;
