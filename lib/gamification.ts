import { createClient } from '@/lib/supabase/server'
import { calculateLevel, calculate1RM } from './types'
import type { Achievement, UserAchievement, LevelInfo } from './types'

// XP rewards
export const XP_REWARDS = {
  COMPLETE_WORKOUT: 100,
  STREAK_DAY: 50,
  NEW_PR: 200,
  FIRST_WORKOUT: 150,
} as const

// Get user's current level info
export async function getUserLevelInfo(userId: string): Promise<LevelInfo> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('xp_points')
    .eq('id', userId)
    .single()
  
  return calculateLevel(data?.xp_points || 0)
}

// Award XP to user
export async function awardXP(userId: string, amount: number): Promise<{ newXP: number; leveledUp: boolean; newLevel: number }> {
  const supabase = await createClient()
  
  // Get current XP
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp_points, level')
    .eq('id', userId)
    .single()
  
  const currentXP = profile?.xp_points || 0
  const currentLevel = profile?.level || 1
  const newXP = currentXP + amount
  const newLevelInfo = calculateLevel(newXP)
  const leveledUp = newLevelInfo.level > currentLevel
  
  // Update profile
  await supabase
    .from('profiles')
    .update({ 
      xp_points: newXP, 
      level: newLevelInfo.level 
    })
    .eq('id', userId)
  
  return {
    newXP,
    leveledUp,
    newLevel: newLevelInfo.level
  }
}

// Update streak
export async function updateStreak(userId: string): Promise<{ streakDays: number; streakBroken: boolean }> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_days, last_workout_at')
    .eq('id', userId)
    .single()
  
  const now = new Date()
  const lastWorkout = profile?.last_workout_at ? new Date(profile.last_workout_at) : null
  const currentStreak = profile?.streak_days || 0
  
  let newStreak = 1
  let streakBroken = false
  
  if (lastWorkout) {
    const daysSinceLastWorkout = Math.floor((now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastWorkout === 0) {
      // Same day, keep streak
      newStreak = currentStreak
    } else if (daysSinceLastWorkout === 1) {
      // Consecutive day, increment streak
      newStreak = currentStreak + 1
    } else {
      // Streak broken
      newStreak = 1
      streakBroken = currentStreak > 0
    }
  }
  
  // Update profile
  await supabase
    .from('profiles')
    .update({ 
      streak_days: newStreak, 
      last_workout_at: now.toISOString() 
    })
    .eq('id', userId)
  
  return { streakDays: newStreak, streakBroken }
}

// Check and unlock achievements
export async function checkAchievements(userId: string): Promise<Achievement[]> {
  const supabase = await createClient()
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp_points, level, streak_days')
    .eq('id', userId)
    .single()
  
  // Get client data
  const { data: client } = await supabase
    .from('clients')
    .select('id, total_sessions')
    .eq('user_id', userId)
    .single()
  
  // Get all achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
  
  // Get user's unlocked achievements
  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)
  
  const unlockedIds = new Set(unlockedAchievements?.map(ua => ua.achievement_id) || [])
  const newlyUnlocked: Achievement[] = []
  
  for (const achievement of allAchievements || []) {
    if (unlockedIds.has(achievement.id)) continue
    
    let qualified = false
    
    switch (achievement.requirement_type) {
      case 'sessions':
        qualified = (client?.total_sessions || 0) >= achievement.requirement_value
        break
      case 'streak':
        qualified = (profile?.streak_days || 0) >= achievement.requirement_value
        break
      case 'level':
        qualified = (profile?.level || 1) >= achievement.requirement_value
        break
      case 'pr':
        // Count total unique PRs
        const { count: prCount } = await supabase
          .from('personal_records')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client?.id)
        
        qualified = (prCount || 0) >= achievement.requirement_value
        break
      case 'volume':
        // Check if any session has reached this volume
        const { data: maxVolumeSession } = await supabase
          .from('workout_sessions')
          .select('total_volume_kg')
          .eq('client_id', client?.id)
          .order('total_volume_kg', { ascending: false })
          .limit(1)
          .single()
        
        qualified = (maxVolumeSession?.total_volume_kg || 0) >= achievement.requirement_value
        break
    }
    
    if (qualified) {
      // Unlock achievement
      await supabase
        .from('user_achievements')
        .insert({ user_id: userId, achievement_id: achievement.id })
      
      // Award XP
      await awardXP(userId, achievement.xp_reward)
      
      newlyUnlocked.push(achievement)
    }
  }
  
  return newlyUnlocked
}

// Get user achievements
export async function getUserAchievements(userId: string): Promise<{
  unlocked: UserAchievement[]
  locked: Achievement[]
  progress: Map<string, number>
}> {
  const supabase = await createClient()
  
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('xp_reward', { ascending: true })
  
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', userId)
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp_points, level, streak_days')
    .eq('id', userId)
    .single()
  
  const { data: client } = await supabase
    .from('clients')
    .select('total_sessions')
    .eq('user_id', userId)
    .single()

  const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])
  const progress = new Map<string, number>()

  for (const achievement of allAchievements || []) {
    if (unlockedIds.has(achievement.id)) {
      progress.set(achievement.id, achievement.requirement_value)
      continue
    }

    let currentVal = 0
    switch (achievement.requirement_type) {
      case 'sessions':
        currentVal = client?.total_sessions || 0
        break
      case 'streak':
        currentVal = profile?.streak_days || 0
        break
      case 'level':
        currentVal = profile?.level || 1
        break
      case 'pr':
        // Get PR count
        const { count: prCount } = await supabase
          .from('personal_records')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client?.id)
        currentVal = prCount || 0
        break
      case 'volume':
        // Get max volume session
        const { data: maxVolumeSession } = await supabase
          .from('workout_sessions')
          .select('total_volume_kg')
          .eq('client_id', client?.id)
          .order('total_volume_kg', { ascending: false })
          .limit(1)
          .maybeSingle()
        currentVal = maxVolumeSession?.total_volume_kg || 0
        break
    }
    progress.set(achievement.id, currentVal)
  }
  
  return {
    unlocked: userAchievements || [],
    locked: (allAchievements || []).filter(a => !unlockedIds.has(a.id)),
    progress
  }
}

// Check for new PR
export async function checkAndRecordPR(
  clientId: string, 
  exerciseId: string, 
  weightKg: number, 
  reps: number
): Promise<{ isPR: boolean; estimated1RM: number }> {
  const supabase = await createClient()
  const estimated1RM = calculate1RM(weightKg, reps)
  
  // Get current PR
  const { data: currentPR } = await supabase
    .from('personal_records')
    .select('estimated_1rm')
    .eq('client_id', clientId)
    .eq('exercise_id', exerciseId)
    .single()
  
  const isPR = !currentPR || estimated1RM > (currentPR.estimated_1rm || 0)
  
  if (isPR) {
    // Upsert PR
    await supabase
      .from('personal_records')
      .upsert({
        client_id: clientId,
        exercise_id: exerciseId,
        weight_kg: weightKg,
        reps: reps,
        estimated_1rm: estimated1RM,
        achieved_at: new Date().toISOString()
      }, {
        onConflict: 'client_id,exercise_id'
      })
  }
  
  return { isPR, estimated1RM }
}
