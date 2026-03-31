"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoUpload } from "@/components/photos/photo-upload";
import { PhotoGallery } from "@/components/photos/photo-gallery";
import { PhotoCompare } from "@/components/photos/photo-compare";
import type { ProgressPhoto } from "@/components/photos/photo-card";
import { LayoutGrid, Diff, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function PhotosContent({
  clientId,
  initialPhotos,
}: {
  clientId: string;
  initialPhotos: ProgressPhoto[];
}) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(initialPhotos);
  const [activeTab, setActiveTab] = useState("gallery");
  const { toast } = useToast();

  const onUploadSuccess = useCallback(
    (newPhoto: ProgressPhoto) => {
      setPhotos((prev) => [newPhoto, ...prev]);
      setActiveTab("gallery");
      toast({
        title: "¡Foto guardada!",
        description: "Tu progreso ha sido actualizado correctamente.",
      });
    },
    [toast],
  );

  const onDeleteSuccess = useCallback(
    async (deletedId: string) => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("progress_photos")
          .delete()
          .eq("id", deletedId);

        if (error) throw error;

        setPhotos((prev) => prev.filter((p) => p.id !== deletedId));
        toast({
          title: "Foto eliminada",
          variant: "destructive",
        });
      } catch (err) {
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar la foto de la base de datos.",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 h-12 p-1 bg-muted/50 rounded-2xl mb-8">
          <TabsTrigger value="gallery" className="rounded-xl gap-2">
            <LayoutGrid className="size-4" />
            <span className="hidden sm:inline">Galería</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="rounded-xl gap-2">
            <Diff className="size-4" />
            <span className="hidden sm:inline">Comparar</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="rounded-xl gap-2">
            <UploadCloud className="size-4" />
            <span className="hidden sm:inline">Subir</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="focus-visible:outline-none">
          <PhotoGallery photos={photos} onDeleteSuccess={onDeleteSuccess} />
        </TabsContent>

        <TabsContent value="compare" className="focus-visible:outline-none">
          <PhotoCompare photos={photos} />
        </TabsContent>

        <TabsContent value="upload" className="focus-visible:outline-none">
          <PhotoUpload clientId={clientId} onSuccess={onUploadSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
