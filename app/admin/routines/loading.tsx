import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminRoutinesLoading() {
  return (
    <div className="bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
