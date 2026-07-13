-- Create a new storage bucket for DVI photos
INSERT INTO storage.buckets (id, name, public) VALUES ('dvi_photos', 'dvi_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the dvi_photos bucket
DROP POLICY IF EXISTS "Public access to DVI photos" ON storage.objects;
CREATE POLICY "Public access to DVI photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'dvi_photos');

DROP POLICY IF EXISTS "Authenticated users can upload DVI photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload DVI photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dvi_photos');

DROP POLICY IF EXISTS "Authenticated users can update DVI photos" ON storage.objects;
CREATE POLICY "Authenticated users can update DVI photos" ON storage.objects
FOR UPDATE TO authenticated
WITH CHECK (bucket_id = 'dvi_photos');

DROP POLICY IF EXISTS "Authenticated users can delete DVI photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete DVI photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'dvi_photos');
