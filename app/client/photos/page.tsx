import { getAuthUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientStackPageHeader,
} from "@/components/client/client-app-page-parts";
import { PhotosContent } from "./photos-content";

export default async function ClientPhotosPage() {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();

  const { data: clientRecord } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!clientRecord) redirect("/client/dashboard");

  const { data: photos } = await supabase
    .from("progress_photos")
    .select("id, photo_url, view_type, weight_kg, notes, taken_at, created_at")
    .eq("client_id", clientRecord.id)
    .order("taken_at", { ascending: false });

  const photoList = photos || [];
  const n = photoList.length;
  const photosSubtitle =
    n === 0
      ? "Sin fotos aún · sube la primera desde la pestaña Subir"
      : `${n} ${n === 1 ? "foto" : "fotos"} en tu galería`;

  return (
    <>
      <ClientStackPageHeader title="Fotos" subtitle={photosSubtitle} />
      <div className={CLIENT_DATA_PAGE_SHELL}>
        <PhotosContent
          clientId={clientRecord.id as string}
          initialPhotos={photoList}
        />
      </div>
    </>
  );
}
