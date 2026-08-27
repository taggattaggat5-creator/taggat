DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_sessions' AND column_name = 'machine_status') THEN
    ALTER TABLE activity_sessions ADD COLUMN machine_status text NOT NULL DEFAULT 'idle';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_sessions' AND column_name = 'machine_instance_id') THEN
    ALTER TABLE activity_sessions ADD COLUMN machine_instance_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_sessions' AND column_name = 'machine_ip') THEN
    ALTER TABLE activity_sessions ADD COLUMN machine_ip text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_sessions' AND column_name = 'machine_url') THEN
    ALTER TABLE activity_sessions ADD COLUMN machine_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_sessions' AND column_name = 'machine_error') THEN
    ALTER TABLE activity_sessions ADD COLUMN machine_error text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'labs' AND column_name = 'is_automated') THEN
    ALTER TABLE labs ADD COLUMN is_automated boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'labs' AND column_name = 'n8n_workflow_id') THEN
    ALTER TABLE labs ADD COLUMN n8n_workflow_id text;
  END IF;
END $$;