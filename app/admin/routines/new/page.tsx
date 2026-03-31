import { redirect } from "next/navigation";

export default function NewRoutinePage() {
  redirect("/admin/routines/builder");
}
