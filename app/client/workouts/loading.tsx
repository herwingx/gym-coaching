import { ClientWorkoutsPageSkeleton } from "@/components/client/client-data-pages-skeleton";

export default function Loading() {
  return (
    <div id="main-content" role="main" tabIndex={-1}>
      <ClientWorkoutsPageSkeleton />
    </div>
  );
}
