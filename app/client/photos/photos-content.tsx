'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhotoUpload } from './photo-upload'
import { PhotoGallery } from './photo-gallery'
import { PhotoCompare } from './photo-compare'

export interface ProgressPhoto {
  id: string
  photo_url: string
  view_type: string | null
  weight_kg: number | null
  notes: string | null
  taken_at: string
  created_at: string
}

export function PhotosContent({
  clientId,
  initialPhotos,
}: {
  clientId: string
  initialPhotos: ProgressPhoto[]
}) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(initialPhotos)

  const onUploadSuccess = useCallback((newPhoto: ProgressPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev])
  }, [])

  const onDeleteSuccess = useCallback((deletedId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== deletedId))
  }, [])

  return (
    <Tabs defaultValue="gallery" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="gallery">Galería</TabsTrigger>
        <TabsTrigger value="compare">Comparar</TabsTrigger>
        <TabsTrigger value="upload">Subir</TabsTrigger>
      </TabsList>

      <TabsContent value="gallery">
        <PhotoGallery
          photos={photos}
          onDeleteSuccess={onDeleteSuccess}
          clientId={clientId}
        />
      </TabsContent>

      <TabsContent value="compare">
        <PhotoCompare photos={photos} />
      </TabsContent>

      <TabsContent value="upload">
        <PhotoUpload clientId={clientId} onSuccess={onUploadSuccess} />
      </TabsContent>
    </Tabs>
  )
}
