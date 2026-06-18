-- Create the 'catalog-images' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalog-images', 'catalog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'catalog-images' );

-- Allow authenticated users (shop owners) to upload images
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'catalog-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update their images
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'catalog-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete images
CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'catalog-images' AND auth.role() = 'authenticated' );
