INSERT INTO storage.buckets (id, name, public)
  VALUES ('adullam-media', 'adullam-media', true)
  ON CONFLICT (id) DO NOTHING;