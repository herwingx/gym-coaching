"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Activity,
  Target,
  Dumbbell,
  Bell,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { completeOnboarding } from "@/app/actions/onboarding";
import type { FitnessGoal, ExperienceLevel } from "@/lib/types";

interface OnboardingFlowProps {
  userId: string;
  userEmail: string;
}

const STEPS = [
  { id: 1, title: "Perfil", description: "Tus datos básicos", icon: User },
  { id: 2, title: "Físico", description: "Tu punto de partida", icon: Activity },
  { id: 3, title: "Objetivo", description: "Lo que quieres lograr", icon: Target },
  { id: 4, title: "Experiencia", description: "Tu nivel actual", icon: Dumbbell },
  { id: 5, title: "Avisos", description: "Mantente al día", icon: Bell },
];

const FITNESS_GOALS: { value: FitnessGoal; label: string; description: string }[] = [
  { value: "lose_weight", label: "Perder Peso", description: "Quemar grasa y definir" },
  { value: "gain_muscle", label: "Ganar Músculo", description: "Aumentar masa muscular" },
  { value: "maintain", label: "Mantenerme", description: "Conservar mi forma actual" },
  { value: "strength", label: "Fuerza", description: "Ser más fuerte" },
  { value: "endurance", label: "Resistencia", description: "Mejorar mi cardio" },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Principiante", description: "Menos de 6 meses" },
  { value: "intermediate", label: "Intermedio", description: "6 meses a 2 años" },
  { value: "advanced", label: "Avanzado", description: "Más de 2 años" },
];

export function OnboardingFlow({ userId, userEmail }: OnboardingFlowProps) {
  const router = useRouter();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [initialWeight, setInitialWeight] = useState("");
  
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`onboarding_state_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.birthDate) setBirthDate(parsed.birthDate);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.height) setHeight(parsed.height);
        if (parsed.initialWeight) setInitialWeight(parsed.initialWeight);
        if (parsed.fitnessGoal) setFitnessGoal(parsed.fitnessGoal);
        if (parsed.experienceLevel) setExperienceLevel(parsed.experienceLevel);
        if (parsed.notificationsEnabled !== undefined) setNotificationsEnabled(parsed.notificationsEnabled);
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    setIsLoaded(true);
  }, [userId]);

  // Save state
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`onboarding_state_${userId}`, JSON.stringify({
        currentStep, fullName, username, phone, birthDate, gender, height, initialWeight,
        fitnessGoal, experienceLevel, notificationsEnabled
      }));
    }
  }, [isLoaded, currentStep, fullName, username, phone, birthDate, gender, height, initialWeight, fitnessGoal, experienceLevel, notificationsEnabled, userId]);

  if (!isLoaded) return <div className="min-h-dvh flex items-center justify-center bg-background"><div className="animate-spin rounded-full size-8 border-b-2 border-primary"></div></div>;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return fullName.trim().length >= 2 && username.trim().length >= 3;
      case 2:
        return !!birthDate && !!gender && !!height && !!initialWeight;
      case 3:
        return fitnessGoal !== null;
      case 4:
        return experienceLevel !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const parsedHeight = parseFloat(height);
      const parsedWeight = parseFloat(initialWeight);

      const result = await completeOnboarding({
        userId,
        fullName,
        username,
        phone,
        birthDate,
        gender,
        height: isNaN(parsedHeight) ? undefined : parsedHeight,
        initialWeight: isNaN(parsedWeight) ? undefined : parsedWeight,
        fitnessGoal: fitnessGoal!,
        experienceLevel: experienceLevel!,
        notificationsEnabled,
      });

      if (result.success) {
        localStorage.removeItem(`onboarding_state_${userId}`); // Clear state
        toast.success("¡Bienvenido a RU Coach! Tu perfil está listo.");
        window.location.href = "/client/dashboard";
      } else {
        toast.error(result.error || "No pudimos guardar tus datos. Intenta de nuevo.");
      }
    } catch (err) {
      console.error("[Onboarding] Error:", err);
      toast.error("Algo salió mal. Intenta de nuevo o recarga la página.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col font-sans">
      {/* Sleek Mobile-First Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container px-4 h-16 flex items-center gap-3">
          <div className="size-10 rounded-xl overflow-hidden shadow-sm bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <span className="font-black text-primary text-xl">RU</span>
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="font-black tracking-tighter uppercase text-lg">RU Coach</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Configurando tu perfil
            </p>
          </div>
        </div>
      </header>

      {/* Modern Top Stepper Progress */}
      <div className="bg-background border-b pt-4 pb-0 overflow-x-auto hide-scrollbar sticky top-16 z-40">
        <div className="container px-4 min-w-max">
          <div className="flex items-center gap-6 pb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isComplete = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="relative flex flex-col items-center">
                  {/* The connection line */}
                  {index < STEPS.length - 1 && (
                    <div 
                      className={`absolute left-1/2 top-4 w-full h-0.5 -mt-px translate-x-3
                        ${isComplete ? 'bg-primary' : 'bg-muted'}
                      `}
                      aria-hidden="true"
                    />
                  )}
                  {/* The step circle */}
                  <div className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-colors duration-300
                    ${isComplete ? 'border-primary bg-primary text-primary-foreground' : 
                      isCurrent ? 'border-primary bg-background text-primary shadow-[0_0_0_4px] shadow-primary/10' : 
                      'border-border bg-muted/50 text-muted-foreground'}
                  `}>
                    {isComplete ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                  </div>
                  {/* Label */}
                  <span className={`mt-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300
                    ${isCurrent ? 'text-foreground' : isComplete ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-8 pb-32">
        <div className="max-w-xl mx-auto">
          {/* Step 1: Perfil (Datos Básicos) */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Tu perfil</h2>
                <p className="text-muted-foreground text-sm">Empecemos con tu información básica.</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs uppercase font-semibold text-muted-foreground">Nombre completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Ej. Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 text-base px-4 rounded-xl border-border focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs uppercase font-semibold text-muted-foreground">Nombre de usuario</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
                    <Input
                      id="username"
                      placeholder="juanp"
                      className="h-12 pl-10 text-base rounded-xl border-border focus-visible:ring-primary/20"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Este es tu identificador único dentro de RU Coach.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase font-semibold text-muted-foreground">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ej. 55 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-base px-4 rounded-xl border-border focus-visible:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Físico */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Físico y Biometría</h2>
                <p className="text-muted-foreground text-sm">Necesitamos estos datos para calcular tus calorías y progresiones.</p>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-xs uppercase font-semibold text-muted-foreground">Nacimiento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="h-12 px-3 text-base rounded-xl border-border focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-semibold text-muted-foreground">Género</Label>
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="" disabled>Selecciona...</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro / Prefiero no decir</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-xs uppercase font-semibold text-muted-foreground">Estatura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      inputMode="numeric"
                      placeholder="Ej. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="h-12 text-base px-4 rounded-xl border-border focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-xs uppercase font-semibold text-muted-foreground">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      placeholder="Ej. 70.5"
                      value={initialWeight}
                      onChange={(e) => setInitialWeight(e.target.value)}
                      className="h-12 text-base px-4 rounded-xl border-border focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Objetivo */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Tu Objetivo Principal</h2>
                <p className="text-muted-foreground text-sm">Esto dicta el enfoque de tu macrociclo y nutrición.</p>
              </div>
              <div className="space-y-3">
                {FITNESS_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setFitnessGoal(goal.value)}
                    className={`group w-full flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                      fitnessGoal === goal.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 transition-colors ${
                      fitnessGoal === goal.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"
                    }`}>
                      <Target className="size-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-semibold text-base ${fitnessGoal === goal.value ? "text-foreground" : "text-foreground/80"}`}>
                        {goal.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      fitnessGoal === goal.value ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}>
                      {fitnessGoal === goal.value && <div className="size-2 rounded-full bg-primary-foreground" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Experiencia */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Tu Experiencia</h2>
                <p className="text-muted-foreground text-sm">Nos ayuda a elegir la carga y el nivel técnico correcto.</p>
              </div>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setExperienceLevel(level.value)}
                    className={`group w-full flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                      experienceLevel === level.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 transition-colors ${
                      experienceLevel === level.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"
                    }`}>
                      <Dumbbell className="size-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-semibold text-base ${experienceLevel === level.value ? "text-foreground" : "text-foreground/80"}`}>
                        {level.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      experienceLevel === level.value ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}>
                      {experienceLevel === level.value && <div className="size-2 rounded-full bg-primary-foreground" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Notifications */}
          {currentStep === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 space-y-1 text-center mt-4">
                <div className="mx-auto size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-primary/5">
                  <Bell className="size-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">¡Casi listo!</h2>
                <p className="text-muted-foreground text-base max-w-sm mx-auto">
                  Mantente al tanto con recordatorios de entrenamiento para que no pierdas tu racha.
                </p>
              </div>

              <div className="mt-8 space-y-3 p-6 bg-muted/30 rounded-3xl border border-border text-center">
                <Button
                  variant={notificationsEnabled ? "default" : "outline"}
                  onClick={() => setNotificationsEnabled(true)}
                  className={`w-full h-14 rounded-xl text-lg font-semibold transition-all ${
                    notificationsEnabled ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : ""
                  }`}
                >
                  <Bell className="mr-2 size-5" /> Activar Notificaciones
                </Button>
                <Button
                  variant={!notificationsEnabled ? "secondary" : "ghost"}
                  onClick={() => setNotificationsEnabled(false)}
                  className="w-full h-14 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Ahora no, continuar sin avisos
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Navigation Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background/90 backdrop-blur-xl border-t z-50">
        <div className="container max-w-xl flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="h-12 px-5 sm:px-6 rounded-xl font-semibold border-border hover:bg-muted"
          >
            <ChevronLeft className="size-5 mr-1" />
            <span className="hidden sm:inline">Atrás</span>
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              Siguiente
              <ChevronRight className="size-5 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Terminar y Comenzar</span>
                  <Check className="size-5" />
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

