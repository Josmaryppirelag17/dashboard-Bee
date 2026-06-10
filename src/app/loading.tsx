export default function Loading() {
  return (
    <div
      className="min-h-screen bg-[#faf6ee] flex flex-col"
      role="status"
      aria-live="polite"
      aria-label="Cargando el panel de la colmena"
    >
      <div className="flex flex-1" aria-hidden="true">
        <main className="flex-1 p-6 space-y-6">
          <div className="bg-white/80 border border-[#ebdcb9] rounded-3xl p-6 space-y-3">
            <div className="h-4 w-48 bg-[#ebdcb9]/40 rounded-lg animate-pulse" />
            <div className="h-7 w-80 bg-[#ebdcb9]/30 rounded-lg animate-pulse" />
            <div className="h-3 w-full max-w-md bg-[#ebdcb9]/20 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/80 border border-[#ebdcb9] rounded-2xl p-5 space-y-3">
                <div className="h-3 w-24 bg-[#ebdcb9]/30 rounded-lg animate-pulse" />
                <div className="h-6 w-16 bg-[#ebdcb9]/40 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
