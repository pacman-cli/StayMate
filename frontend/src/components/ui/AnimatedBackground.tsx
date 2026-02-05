'use client'


export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Dynamic Mesh Gradient */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-30 dark:opacity-20 animate-twist">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.15),transparent_50%)]" />
        <div className="absolute top-[10%] left-[10%] w-1/2 h-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)] animate-float-slow" />
        <div className="absolute bottom-[10%] right-[10%] w-1/2 h-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] animate-float-delayed" />
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'url("/noise.png")' }}></div>

      {/* Grid Pattern (Optional subtle tech feel) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] opacity-20 dark:opacity-10"></div>
    </div>
  )
}
