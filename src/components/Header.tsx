import type { View } from "../App"

interface Props {
  view: View
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
}

const pageTitles: Partial<Record<View, string>> = {
  dashboard: "Panel",
  table: "PQRS",
  new: "PQRS",
  detail: "PQRS",
  mensajes: "Envíos Individuales",
  masivos: "Envíos Masivos",
}

export default function Header({
  view,
  sidebarCollapsed,
  setSidebarCollapsed,
}: Props) {
  const title = pageTitles[view] ?? "Envios Individuales"

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-5 shrink-0 z-10">
      {/* Hamburger */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <h1 className="text-[15px] font-bold text-slate-800">{title}</h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden sm:block w-64">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar PQRS..."
          className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Bell */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0EA5E9] border-2 border-white" />
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
        A
      </div>
    </header>
  )
}
