import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trophy, Star, TrendingUp, Target, Flame, Info, Award, Crown } from 'lucide-react'
import { AchievementBadge } from '@/components/client/achievement-badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { getLevelName, calculateLevel } from '@/lib/types'
import { getUserAchievements } from '@/lib/gamification'
import { cn } from '@/lib/utils'

export default async function ClientAchievementsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  
  // Get all data in parallel
  const [
    { data: profile },
    { unlocked: userAchievements, locked: lockedAchievements, progress }
  ] = await Promise.all([
    supabase.from('profiles').select('xp_points, level, full_name, avatar_url').eq('id', user.id).single(),
    getUserAchievements(user.id)
  ])

  const levelInfo = calculateLevel(profile?.xp_points || 0)
  const levelName = getLevelName(levelInfo.level)
  const allAchievements = [...userAchievements.map(ua => ua.achievements!), ...lockedAchievements]
  
  const unlockedCount = userAchievements.length
  const totalCount = allAchievements.length
  const unlockedPercentage = Math.round((unlockedCount / totalCount) * 100)

  const categories = [
    { id: 'all', name: 'Todos', icon: Trophy },
    { id: 'consistency', name: 'Constancia', icon: Flame },
    { id: 'strength', name: 'Fuerza', icon: Target },
    { id: 'volume', name: 'Volumen', icon: TrendingUp },
    { id: 'milestone', name: 'Metas', icon: Award },
    { id: 'special', name: 'Especiales', icon: Star },
  ]

  const { data: leaderboardData } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(5)

  const recentlyUnlocked = [...userAchievements]
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm safe-area-header-pt">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="size-11 rounded-full bg-muted/50 hover:bg-muted transition-colors duration-200">
              <Link href="/client/dashboard">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight">Logros y Rango</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                  {levelName}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Desbloqueados</p>
            <p className="text-xl font-black text-primary">{unlockedCount} / {totalCount}</p>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-8 max-w-5xl mx-auto">
        {/* Rango y Nivel Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border p-8 shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 hidden md:block">
            <Crown size={200} />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-black text-primary uppercase tracking-widest">Tu Rango Actual</h2>
                <p className="text-5xl font-black tracking-tighter">{levelName}</p>
              </div>
              
              <div className="space-y-2 max-w-sm">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Nivel {levelInfo.level}</span>
                  <span>XP: {levelInfo.currentXP} / {levelInfo.xpForNextLevel}</span>
                </div>
                <Progress value={levelInfo.progress} className="h-3 bg-primary/10 shadow-inner" />
                <p className="text-[11px] text-muted-foreground">Te faltan <span className="text-primary font-bold">{levelInfo.xpForNextLevel - levelInfo.currentXP} XP</span> para subir al siguiente nivel.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-background/50 backdrop-blur-sm border-dashed">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Completado</p>
                  <p className="text-3xl font-black text-primary">{unlockedPercentage}%</p>
                </CardContent>
              </Card>
              <Card className="bg-background/50 backdrop-blur-sm border-dashed">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Rareza Promedio</p>
                  <p className="text-xl font-black">Épica</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recién Desbloqueados */}
        {recentlyUnlocked.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Award className="size-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Desbloqueados Recientemente</h3>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
              {recentlyUnlocked.map((ua) => (
                <Card key={ua.id} className="relative group hover:border-primary/50 transition-colors bg-card/50">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <AchievementBadge 
                      achievement={ua.achievements!} 
                      unlocked 
                      size="lg"
                    />
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{ua.achievements!.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Desbloqueado el {new Date(ua.unlocked_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Todos los Logros con Tabs */}
        <section className="space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <TabsList className="bg-muted/50 p-1 h-auto flex flex-wrap justify-center sm:justify-start">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="flex items-center gap-2 py-2 px-4 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                  >
                    <cat.icon className="size-3 sm:size-4" />
                    <span>{cat.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {allAchievements
                    .filter(a => cat.id === 'all' || a.category === cat.id)
                    .map((achievement) => (
                      <Card 
                        key={achievement.id} 
                        className={cn(
                          "relative group overflow-hidden transition-all duration-300 hover:scale-[1.02] border-muted",
                          !progress.has(achievement.id) && "opacity-60"
                        )}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                          <AchievementBadge
                            achievement={achievement}
                            unlocked={userAchievements.some(ua => ua.achievement_id === achievement.id)}
                            size="md"
                            showDetails={false}
                            progress={progress.get(achievement.id) || 0}
                            showProgress={true}
                          />
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold tracking-tight line-clamp-1">{achievement.name}</h4>
                            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2 h-6">
                              {achievement.description}
                            </p>
                          </div>
                          
                          {/* Hover Overlay for info */}
                          <div className="absolute inset-0 bg-background/95 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Requisito</p>
                            <p className="text-xs font-medium leading-relaxed">
                              {achievement.description}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Star className="size-3 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-black">+{achievement.xp_reward} XP</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Leaderboard Preview */}
        {leaderboardData && leaderboardData.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Crown className="size-5 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Top Atletas</h3>
            </div>
            <Card className="overflow-hidden border-none shadow-md bg-card">
              <CardContent className="p-0">
                <div className="divide-y">
                  {leaderboardData.map((entry, i) => (
                    <div 
                      key={entry.id} 
                      className={cn(
                        "flex items-center gap-4 p-4 transition-colors",
                        entry.id === user.id ? "bg-primary/5" : "hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-center size-6 font-black text-sm text-muted-foreground italic">
                        {i + 1}
                      </div>
                      <div className="relative">
                        <div className="size-10 rounded-full bg-muted overflow-hidden border-2 border-background shadow-sm">
                          {entry.avatar_url ? (
                            <Image src={entry.avatar_url} alt={entry.full_name} width={40} height={40} className="size-full object-cover" />
                          ) : (
                            <div className="size-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                              {entry.full_name[0]}
                            </div>
                          )}
                        </div>
                        {i === 0 && <Crown className="absolute -top-2 -right-1 size-4 text-amber-500 fill-amber-500 drop-shadow-sm rotate-12" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate flex items-center gap-2">
                          {entry.full_name}
                          {entry.id === user.id && <Badge className="text-[8px] h-3.5 px-1 uppercase tracking-tighter">Tú</Badge>}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{getLevelName(entry.level)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">{entry.xp_points} XP</p>
                        <p className="text-[10px] text-muted-foreground font-bold">{entry.achievements_count} Logros</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Pie de página Informativo */}
        <section className="bg-muted/30 rounded-2xl p-6 border border-dashed flex items-start gap-4">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="size-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold">¿Cómo ganar XP?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ganarás XP al completar tus rutinas diarias (+100 XP), registrar récords personales (+200 XP), 
              mantener rachas de entrenamiento (+50 XP/día) y desbloquear logros especiales. 
              ¡Sube de nivel para demostrar tu compromiso y disciplina!
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
