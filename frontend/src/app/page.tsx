import FluidGradient from '@/components/cinematic/FluidGradient'
import SceneAILogic from '@/components/scenes/SceneAILogic'
import SceneEcosystem from '@/components/scenes/SceneEcosystem'
import SceneLivingSpaces from '@/components/scenes/SceneLivingSpaces'
import ScenePhilosophy from '@/components/scenes/ScenePhilosophy'
import SceneResolution from '@/components/scenes/SceneResolution'
import SceneSilentHero from '@/components/scenes/SceneSilentHero'
import SceneTrust from '@/components/scenes/SceneTrust'

export default function Home() {
  return (
    <main className="relative min-h-screen selection:bg-lux-indigo/30 selection:text-white">
      {/* 1. Atmospheric Background Layer */}
      <FluidGradient />

      {/* 2. Navigation (Minimalist / Silent) */}
      <nav className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center mix-blend-difference text-white opacity-80">
        <span className="font-display font-bold tracking-tighter text-xl">STAYMATE.</span>
        <div className="hidden md:flex gap-8 text-xs font-mono uppercase tracking-widest">
          <span>Philosophy</span>
          <span>Spaces</span>
          <span>Account</span>
        </div>
      </nav>

      {/* 3. The Narrative Timeline (Scenes) */}
      <div className="relative z-10 flex flex-col">
        <SceneSilentHero />
        <ScenePhilosophy />
        <SceneAILogic />
        <SceneLivingSpaces />
        <SceneEcosystem />
        <SceneTrust />
        <SceneResolution />
      </div>

    </main>
  )
}
