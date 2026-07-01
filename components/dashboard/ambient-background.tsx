export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 surface-grid opacity-40" />
      <div className="absolute -left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute right-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[30%] h-[350px] w-[350px] rounded-full bg-fuchsia-600/6 blur-[100px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
    </div>
  );
}
