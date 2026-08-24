import { useEffect, useRef, useState } from "react"

interface Props {
  onIngresar: () => void
}

/* ─────────────────────────────────────────────
   Acceso a Concept CRM

   Pantalla partida: a la izquierda la columna de
   acceso —credenciales, verificación en dos pasos
   y códigos de respaldo—, a la derecha un panel
   que cuenta de qué se trata el producto, que se
   contrata por módulos, con los mismos colores
   que después verá dentro del sistema.
───────────────────────────────────────────── */

type Paso = "credenciales" | "verificacion" | "recuperacion"

interface Diapositiva {
  modulo: string
  color: string
  titular: string
  detalle: string
  dato: string
  datoLabel: string
  icono: React.ReactNode
}

/* Los colores son los mismos slots validados que usa el Panel */
const diapositivas: Diapositiva[] = [
  {
    modulo: "PQRSDF",
    color: "#2d4fa8",
    titular: "Ninguna solicitud se pasa de término",
    detalle:
      "Cada petición, queja o reclamo entra con su reloj de ley corriendo y su responsable asignado desde el primer minuto.",
    dato: "94,2%",
    datoLabel: "respondidas dentro del plazo legal",
    icono: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    modulo: "Envíos Masivos",
    color: "#0EA5E9",
    titular: "Miles de mensajes con una plantilla",
    detalle:
      "Armas la campaña, eliges la audiencia y ves el despacho en vivo: entrega, lectura y respuesta, mensaje por mensaje.",
    dato: "7.902",
    datoLabel: "mensajes despachados este mes",
    icono: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
    ),
  },
  {
    modulo: "Envíos Individuales",
    color: "#059669",
    titular: "WhatsApp, Instagram y SMS en una bandeja",
    detalle:
      "El asesor atiende por el canal que el ciudadano prefiere, con plantillas a un atajo de distancia y todo el historial a la vista.",
    dato: "4,2 min",
    datoLabel: "de primera respuesta en promedio",
    icono: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    modulo: "Flujos de Trabajo",
    color: "#7c3aed",
    titular: "El proceso corre solo, tu equipo hace su parte",
    detalle:
      "Defines los pasos una vez y el sistema reparte, mide y avisa. Cada quien recibe su tarea con la lista de chequeo lista.",
    dato: "2.885",
    datoLabel: "ejecuciones completadas en el periodo",
    icono: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

const catalogoModulos = [
  { nombre: "PQRSDF", activo: true },
  { nombre: "Envíos Masivos", activo: true },
  { nombre: "Envíos Individuales", activo: true },
  { nombre: "Flujos de Trabajo", activo: true },
  { nombre: "Cobranza", activo: false },
  { nombre: "Fábrica de Créditos", activo: false },
  { nombre: "Base de Conocimiento", activo: false },
]

/* ── Marca ── */
function Isotipo({ size = 34 }: { size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: "#1E3A8A" }}
    >
      <svg viewBox="0 0 20 20" fill="white" style={{ width: size * 0.55, height: size * 0.55 }}>
        <path
          fillRule="evenodd"
          d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.254.716a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.512.878l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

function LogoMicrosoft() {
  return (
    <svg viewBox="0 0 21 21" className="w-4 h-4" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

function LogoGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function IconoEscudo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function IconoFlechaAtras() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path
        fillRule="evenodd"
        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function Cargador() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** Vigencia del desafío de verificación, en segundos. */
const DURACION_DESAFIO = 300

/* ─────────────────────────────────────────────
   Ciclo del código

   TOTP (RFC 6238) rota cada 30 s alineado al reloj
   Unix, así que este número es exactamente el mismo
   que el usuario ve agotarse en su app. Sirve para
   avisarle si alcanza a escribir el código o si le
   conviene esperar el siguiente.
───────────────────────────────────────────── */
const PERIODO_TOTP = 30

function segundosDeLaVentana() {
  return PERIODO_TOTP - (Math.floor(Date.now() / 1000) % PERIODO_TOTP)
}

/* Anillo que se vacía a la par del de la app autenticadora.
   Avanza por segundos, sin interpolar, para que no se rebobine
   al saltar de 1 a 30. */
function AnilloCiclo({ restante, color }: { restante: number; color: string }) {
  const radio = 7
  const vuelta = 2 * Math.PI * radio
  const consumido = vuelta * (1 - restante / PERIODO_TOTP)

  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r={radio} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
      <circle
        cx="10"
        cy="10"
        r={radio}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={vuelta}
        strokeDashoffset={consumido}
        transform="rotate(-90 10 10)"
        style={{ transition: "stroke 300ms ease" }}
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Componente
───────────────────────────────────────────── */
export default function Login({ onIngresar }: Props) {
  const [paso, setPaso] = useState<Paso>("credenciales")

  /* Credenciales */
  const [correo, setCorreo] = useState("")
  const [clave, setClave] = useState("")
  const [verClave, setVerClave] = useState(false)
  const [recordar, setRecordar] = useState(false)

  /* Verificación en dos pasos */
  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(""))
  const [ventanaTotp, setVentanaTotp] = useState(() => segundosDeLaVentana())
  const [respaldo, setRespaldo] = useState("")
  const [confiarEquipo, setConfiarEquipo] = useState(true)
  const [restante, setRestante] = useState(DURACION_DESAFIO)
  const cajas = useRef<(HTMLInputElement | null)[]>([])

  /* Comunes */
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [sacudir, setSacudir] = useState(false)

  /* Panel de marca */
  const [slide, setSlide] = useState(0)
  const [pausado, setPausado] = useState(false)

  const codigo = digitos.join("")
  const completo = codigo.length === 6
  const expirado = restante <= 0

  /* Bajo 7 s ya no alcanza a escribirse: vale más esperar el siguiente */
  const porVencer = ventanaTotp <= 7
  const colorCiclo = porVencer ? "#f59e0b" : "#1E3A8A"

  /* El rotador se detiene mientras el cursor está encima */
  useEffect(() => {
    if (pausado) return
    const t = setInterval(() => setSlide(s => (s + 1) % diapositivas.length), 5000)
    return () => clearInterval(t)
  }, [pausado])

  /* Las dos cuentas regresivas solo corren durante la verificación */
  useEffect(() => {
    if (paso !== "verificacion") return
    setVentanaTotp(segundosDeLaVentana())
    const t = setInterval(() => {
      setRestante(r => Math.max(0, r - 1))
      setVentanaTotp(segundosDeLaVentana())
    }, 1000)
    return () => clearInterval(t)
  }, [paso])

  /* Al entrar a la verificación el foco cae en la primera casilla */
  useEffect(() => {
    if (paso === "verificacion") cajas.current[0]?.focus()
  }, [paso])

  const d = diapositivas[slide]

  const marcarError = (mensaje: string) => {
    setError(mensaje)
    setSacudir(true)
    setTimeout(() => setSacudir(false), 450)
  }

  /* ── Paso 1 · Credenciales ── */
  const validarCredenciales = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      marcarError("Escribe un correo corporativo válido")
      return
    }
    if (clave.length < 6) {
      marcarError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setError("")
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      setRestante(DURACION_DESAFIO)
      setDigitos(Array(6).fill(""))
      setPaso("verificacion")
    }, 800)
  }

  /* El acceso federado no pide segundo factor: el proveedor ya lo verificó */
  const entrarConProveedor = () => {
    setError("")
    setCargando(true)
    setTimeout(onIngresar, 900)
  }

  const usarDemo = () => {
    setCorreo("ana.martinez@pqrslab.com")
    setClave("demo1234")
    setError("")
  }

  /* ── Paso 2 · Código de la app autenticadora ── */
  const escribirDigito = (i: number, valor: string) => {
    const limpio = valor.replace(/\D/g, "")
    if (!limpio) {
      setDigitos(p => p.map((x, j) => (j === i ? "" : x)))
      return
    }
    /* Si llegan varios dígitos de una, se reparten desde esta casilla */
    const nuevos = [...digitos]
    limpio.split("").forEach((c, k) => {
      if (i + k < 6) nuevos[i + k] = c
    })
    setDigitos(nuevos)
    setError("")
    cajas.current[Math.min(5, i + limpio.length)]?.focus()
  }

  const teclaDigito = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digitos[i] && i > 0) {
      e.preventDefault()
      setDigitos(p => p.map((x, j) => (j === i - 1 ? "" : x)))
      cajas.current[i - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && i > 0) cajas.current[i - 1]?.focus()
    if (e.key === "ArrowRight" && i < 5) cajas.current[i + 1]?.focus()
    if (e.key === "Enter" && completo) validarCodigo()
  }

  const pegarCodigo = (e: React.ClipboardEvent) => {
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!texto) return
    e.preventDefault()
    const nuevos = Array(6).fill("")
    texto.split("").forEach((c, k) => (nuevos[k] = c))
    setDigitos(nuevos)
    setError("")
    cajas.current[Math.min(5, texto.length)]?.focus()
  }

  const validarCodigo = () => {
    if (expirado) {
      marcarError("El desafío expiró. Solicita uno nuevo para continuar.")
      return
    }
    if (!completo) {
      marcarError("Completa los seis dígitos del código")
      return
    }
    setError("")
    setCargando(true)
    setTimeout(onIngresar, 900)
  }

  const validarRespaldo = () => {
    if (respaldo.replace(/\W/g, "").length < 8) {
      marcarError("Un código de recuperación tiene al menos 8 caracteres")
      return
    }
    setError("")
    setCargando(true)
    setTimeout(onIngresar, 900)
  }

  const reiniciarDesafio = () => {
    setRestante(DURACION_DESAFIO)
    setDigitos(Array(6).fill(""))
    setError("")
    cajas.current[0]?.focus()
  }

  const volverACredenciales = () => {
    setPaso("credenciales")
    setError("")
    setDigitos(Array(6).fill(""))
    setRespaldo("")
  }

  /* Bloque de error compartido por los tres pasos */
  const bloqueError = error ? (
    <div
      className={`flex items-start gap-2 mt-3 rounded-xl px-3 py-2.5 ${sacudir ? "sacudir" : ""}`}
      style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
    >
      <svg viewBox="0 0 20 20" fill="#dc2626" className="w-4 h-4 shrink-0 mt-px">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 012 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-[11px] font-medium" style={{ color: "#991b1b" }}>
        {error}
      </p>
    </div>
  ) : null

  /* Contenido de cada paso, montado después en el diseño que corresponda */
  const contenidoCredenciales = (
    <div key="credenciales">
      <div className="entra" style={{ "--retraso": "90ms" } as React.CSSProperties}>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-slate-400 mt-1.5">
          Ingresa con las credenciales de tu organización para continuar.
        </p>
      </div>

      {/* Acceso federado */}
      <div className="grid grid-cols-2 gap-2.5 mt-7 entra" style={{ "--retraso": "160ms" } as React.CSSProperties}>
        {[
          { logo: <LogoMicrosoft />, label: "Microsoft 365" },
          { logo: <LogoGoogle />, label: "Google Workspace" },
        ].map(p => (
          <button
            key={p.label}
            onClick={entrarConProveedor}
            disabled={cargando}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {p.logo}
            <span className="text-[11px] font-semibold text-slate-600">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 my-6 entra" style={{ "--retraso": "220ms" } as React.CSSProperties}>
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
          o con tu correo
        </span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Correo */}
      <div className="entra" style={{ "--retraso": "280ms" } as React.CSSProperties}>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Correo electrónico
        </label>
        <div className="relative">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <input
            value={correo}
            onChange={e => {
              setCorreo(e.target.value)
              setError("")
            }}
            onKeyDown={e => e.key === "Enter" && validarCredenciales()}
            type="email"
            autoComplete="email"
            placeholder="nombre@organizacion.com"
            className="w-full pl-10 pr-3 py-3 rounded-xl border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/15 focus:border-[#0EA5E9] focus:bg-white transition-all"
            style={{ borderColor: error && !correo ? "#fca5a5" : "#e2e8f0" }}
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="mt-4 entra" style={{ "--retraso": "340ms" } as React.CSSProperties}>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Contraseña
          </label>
          <button className="text-[11px] font-semibold text-[#0EA5E9] hover:text-[#0284c7] transition-colors cursor-pointer">
            Recuperar contraseña
          </button>
        </div>
        <div className="relative">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <input
            value={clave}
            onChange={e => {
              setClave(e.target.value)
              setError("")
            }}
            onKeyDown={e => e.key === "Enter" && validarCredenciales()}
            type={verClave ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full pl-10 pr-11 py-3 rounded-xl border bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/15 focus:border-[#0EA5E9] focus:bg-white transition-all"
            style={{ borderColor: error && clave.length < 6 ? "#fca5a5" : "#e2e8f0" }}
          />
          <button
            onClick={() => setVerClave(v => !v)}
            title={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            {verClave ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {bloqueError}

      {/* Recordar */}
      <button
        onClick={() => setRecordar(v => !v)}
        className="flex items-center gap-2.5 mt-4 cursor-pointer group entra"
        style={{ "--retraso": "400ms" } as React.CSSProperties}
      >
        <span
          className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 border-2 transition-all"
          style={{
            background: recordar ? "#1E3A8A" : "#fff",
            borderColor: recordar ? "#1E3A8A" : "#cbd5e1",
          }}
        >
          {recordar && (
            <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
        <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
          Mantener la sesión abierta por 30 días
        </span>
      </button>

      {/* Continuar */}
      <button
        onClick={validarCredenciales}
        disabled={cargando}
        className="w-full mt-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer active:scale-[0.98] disabled:cursor-wait flex items-center justify-center gap-2 entra"
        style={{
          background: "#1E3A8A",
          boxShadow: "0 10px 24px -10px rgba(30,58,138,0.65)",
          "--retraso": "460ms",
        } as React.CSSProperties}
        onMouseEnter={e => {
          if (!cargando) e.currentTarget.style.background = "#162d6e"
        }}
        onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
      >
        {cargando ? (
          <>
            <Cargador />
            Verificando credenciales…
          </>
        ) : (
          <>
            Continuar
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </>
        )}
      </button>

      <button
        onClick={usarDemo}
        className="w-full mt-3 text-[11px] text-slate-400 hover:text-[#1E3A8A] transition-colors cursor-pointer entra"
        style={{ "--retraso": "520ms" } as React.CSSProperties}
      >
        ¿Solo quieres ver el sistema?{" "}
        <span className="font-semibold underline">Usar credenciales de demostración</span>
      </button>
    </div>
  )

  const contenidoVerificacion = (
    <div key="verificacion">
      <button
        onClick={volverACredenciales}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer entra"
        style={{ "--retraso": "0ms" } as React.CSSProperties}
      >
        <IconoFlechaAtras />
        Volver
      </button>

      <div className="entra mt-7" style={{ "--retraso": "70ms" } as React.CSSProperties}>
        <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">
          Verificación en dos pasos
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Abre tu app autenticadora e ingresa el código de 6 dígitos que muestra para{" "}
          <span className="font-semibold text-slate-600">{correo || "tu cuenta"}</span>.
        </p>
      </div>

      {/* Casillas del código */}
      <div
        className={`flex items-center gap-2.5 mt-8 entra ${sacudir ? "sacudir" : ""}`}
        style={{ "--retraso": "140ms" } as React.CSSProperties}
      >
        {digitos.map((valor, i) => (
          <input
            key={i}
            ref={el => {
              cajas.current[i] = el
            }}
            value={valor}
            onChange={e => escribirDigito(i, e.target.value)}
            onKeyDown={e => teclaDigito(i, e)}
            onPaste={pegarCodigo}
            onFocus={e => e.currentTarget.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={6}
            disabled={expirado || cargando}
            className="flex-1 min-w-0 h-[60px] rounded-xl border-2 bg-slate-50 text-center text-xl font-bold font-mono text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/15 focus:bg-white transition-all disabled:opacity-50"
            style={{
              borderColor: error ? "#fca5a5" : valor ? "#1E3A8A" : "#e2e8f0",
            }}
          />
        ))}
      </div>

      {bloqueError}

      {/* ───── Ciclo del código ─────
          El mismo anillo que se agota en la app autenticadora, en el
          mismo segundo: el usuario sabe si alcanza a escribirlo o si
          le conviene esperar el siguiente en lugar de fallar y repetir. */}
      <div className="mt-5 h-6 flex items-center">
        {expirado ? (
          <button
            onClick={reiniciarDesafio}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0EA5E9] hover:text-[#0284c7] transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            El desafío venció · solicitar uno nuevo
          </button>
        ) : (
          <span
            className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-colors"
            style={{
              borderColor: porVencer ? "#fde68a" : "#e2e8f0",
              background: porVencer ? "#fffbeb" : "#f8fafc",
            }}
          >
            <AnilloCiclo restante={ventanaTotp} color={colorCiclo} />
            <span className="text-[11px] font-medium" style={{ color: porVencer ? "#92400e" : "#94a3b8" }}>
              {porVencer ? (
                <>
                  El código cambia en{" "}
                  <span className="font-mono font-bold">{ventanaTotp}s</span> · espera el siguiente
                </>
              ) : (
                <>
                  Tu app renueva el código en{" "}
                  <span className="font-mono font-bold text-slate-500">{ventanaTotp}s</span>
                </>
              )}
            </span>
          </span>
        )}
      </div>

      {/* Confiar en el equipo */}
      <button
        onClick={() => setConfiarEquipo(v => !v)}
        className="flex items-center gap-2.5 mt-6 cursor-pointer group text-left"
      >
        <span
          className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 border-2 transition-all"
          style={{
            background: confiarEquipo ? "#1E3A8A" : "#fff",
            borderColor: confiarEquipo ? "#1E3A8A" : "#cbd5e1",
          }}
        >
          {confiarEquipo && (
            <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
        <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
          Confiar en este equipo por 30 días
        </span>
      </button>

      <button
        onClick={() => {
          setPaso("recuperacion")
          setError("")
        }}
        className="w-full mt-7 text-[11px] font-bold text-[#0EA5E9] hover:text-[#0284c7] transition-colors cursor-pointer"
      >
        ¿Perdiste el acceso? Usa un código de recuperación
      </button>

      {/* Validar */}
      <button
        onClick={validarCodigo}
        disabled={cargando || !completo || expirado}
        className="w-full mt-4 py-4 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: completo && !expirado ? "#1E3A8A" : "#e2e8f0",
          color: completo && !expirado ? "#fff" : "#94a3b8",
          boxShadow: completo && !expirado ? "0 10px 24px -10px rgba(30,58,138,0.65)" : "none",
        }}
        onMouseEnter={e => {
          if (completo && !expirado && !cargando) e.currentTarget.style.background = "#162d6e"
        }}
        onMouseLeave={e => {
          if (completo && !expirado) e.currentTarget.style.background = "#1E3A8A"
        }}
      >
        {cargando ? (
          <>
            <Cargador />
            Validando código…
          </>
        ) : (
          <>
            Validar
            <IconoEscudo />
          </>
        )}
      </button>
    </div>
  )

  const contenidoRecuperacion = (
    <div key="recuperacion">
      <button
        onClick={() => {
          setPaso("verificacion")
          setError("")
        }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer entra"
        style={{ "--retraso": "0ms" } as React.CSSProperties}
      >
        <IconoFlechaAtras />
        Volver a la verificación
      </button>

      <div className="entra mt-7" style={{ "--retraso": "70ms" } as React.CSSProperties}>
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "#fef3c7", color: "#92400e" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <h1 className="text-[22px] font-bold text-slate-800 tracking-tight mt-4">
          Código de recuperación
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Ingresa uno de los códigos de respaldo que guardaste al activar la verificación en dos pasos.
          Cada código sirve una sola vez.
        </p>
      </div>

      <div className="mt-8 entra" style={{ "--retraso": "140ms" } as React.CSSProperties}>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Código de respaldo
        </label>
        <input
          value={respaldo}
          onChange={e => {
            setRespaldo(e.target.value.toUpperCase())
            setError("")
          }}
          onKeyDown={e => e.key === "Enter" && validarRespaldo()}
          autoFocus
          placeholder="XXXX-XXXX-XXXX"
          className={`w-full px-4 py-3.5 rounded-xl border-2 bg-slate-50 text-center text-base font-bold font-mono tracking-[0.2em] text-slate-700 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/15 focus:bg-white transition-all ${
            sacudir ? "sacudir" : ""
          }`}
          style={{ borderColor: error ? "#fca5a5" : respaldo ? "#1E3A8A" : "#e2e8f0" }}
        />
      </div>

      {bloqueError}

      <button
        onClick={validarRespaldo}
        disabled={cargando}
        className="w-full mt-7 py-4 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer active:scale-[0.98] disabled:cursor-wait flex items-center justify-center gap-2"
        style={{ background: "#1E3A8A", boxShadow: "0 10px 24px -10px rgba(30,58,138,0.65)" }}
        onMouseEnter={e => {
          if (!cargando) e.currentTarget.style.background = "#162d6e"
        }}
        onMouseLeave={e => (e.currentTarget.style.background = "#1E3A8A")}
      >
        {cargando ? (
          <>
            <Cargador />
            Validando código…
          </>
        ) : (
          <>
            Validar código de respaldo
            <IconoEscudo />
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-300 text-center mt-5 leading-relaxed">
        ¿Tampoco tienes los códigos de respaldo? Escribe a soporte@conceptbpo.com para verificar tu
        identidad.
      </p>
    </div>
  )

  /* ═══════════════════════════════════════════
     Verificación y recuperación: pantalla sola.
     Sin el panel de marca, para que la atención
     quede completa sobre el código.
  ═══════════════════════════════════════════ */
  if (paso === "verificacion" || paso === "recuperacion") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
        style={{ background: "#F8FAFC", fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="w-full" style={{ maxWidth: 480 }}>

          {/* Marca centrada */}
          <div
            className="flex flex-col items-center entra"
            style={{ "--retraso": "0ms" } as React.CSSProperties}
          >
            <p className="text-xl font-bold tracking-tight" style={{ color: "#1E3A8A" }}>
              Concept CRM
            </p>
            <p className="text-xs text-slate-400 mt-1">Admin Console &amp; Operations</p>
          </div>

          {/* Tarjeta del paso */}
          <div
            className="bg-white rounded-2xl border border-slate-200 mt-8 entra"
            style={
              {
                padding: "34px 36px 36px",
                boxShadow: "0 16px 40px -24px rgba(15,23,42,0.30)",
                "--retraso": "90ms",
              } as React.CSSProperties
            }
          >
            {paso === "verificacion" ? contenidoVerificacion : contenidoRecuperacion}
          </div>

          {paso === "verificacion" && (
            <p className="text-[10px] text-slate-300 text-center mt-5">
              En esta demostración cualquier código de 6 dígitos es válido.
            </p>
          )}

          {/* Pie centrado */}
          <div className="flex flex-col items-center gap-3 mt-9">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-300">
              <IconoEscudo className="w-3.5 h-3.5" />
              Protegido por Concept Security
            </span>
            <div className="flex items-center gap-4">
              {["Privacidad", "Términos", "Soporte"].map(l => (
                <button
                  key={l}
                  className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════
     Credenciales: pantalla partida con el panel
     de marca a la derecha.
  ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══════════ IZQUIERDA - Columna de acceso ═══════════ */}
      <div className="w-full lg:w-[46%] xl:w-[42%] flex flex-col bg-white px-6 sm:px-10 py-8 shrink-0">

        {/* Marca, formulario y pie comparten el mismo eje, centrado en la columna */}
        <div className="w-full mx-auto flex flex-col flex-1" style={{ maxWidth: 400 }}>

          {/* Marca */}
          <div
            className="flex items-center gap-2.5 entra shrink-0"
            style={{ "--retraso": "0ms" } as React.CSSProperties}
          >
            <Isotipo />
            <div>
              <p className="text-sm font-bold tracking-tight" style={{ color: "#1E3A8A" }}>
                Concept CRM
              </p>
              <p className="text-[10px] text-slate-400">Admin Console &amp; Operations</p>
            </div>
          </div>

          {/* Formulario, centrado verticalmente */}
          <div className="flex-1 flex flex-col justify-center py-10">{contenidoCredenciales}</div>

          {/* Pie */}
          <div className="flex items-center justify-between gap-4 flex-wrap shrink-0">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-300">
              <IconoEscudo className="w-3.5 h-3.5" />
              Protegido por Concept Security
            </span>
            <div className="flex items-center gap-3">
              {["Privacidad", "Términos", "Soporte"].map(l => (
                <button
                  key={l}
                  className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ DERECHA · Panel de marca ═══════════ */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        {/* Fondo base */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(145deg, #0d1b45 0%, #1E3A8A 60%, #16306f 100%)" }}
        />

        {/* Orbes en deriva */}
        <div
          className="absolute rounded-full orbe-a pointer-events-none"
          style={{
            width: 520,
            height: 520,
            top: "-12%",
            right: "-10%",
            background: "radial-gradient(circle, rgba(14,165,233,0.55) 0%, transparent 68%)",
            filter: "blur(48px)",
          }}
        />
        <div
          className="absolute rounded-full orbe-b pointer-events-none"
          style={{
            width: 460,
            height: 460,
            bottom: "-14%",
            left: "-8%",
            background: "radial-gradient(circle, rgba(45,79,168,0.7) 0%, transparent 66%)",
            filter: "blur(52px)",
          }}
        />
        <div
          className="absolute rounded-full orbe-c pointer-events-none"
          style={{
            width: 340,
            height: 340,
            top: "38%",
            right: "26%",
            background: `radial-gradient(circle, ${d.color}55 0%, transparent 70%)`,
            filter: "blur(60px)",
            transition: "background 900ms ease",
          }}
        />

        {/* Retícula de puntos */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse at 60% 40%, black 20%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at 60% 40%, black 20%, transparent 78%)",
          }}
        />

        {/* Barrido de luz */}
        <div
          className="absolute inset-y-0 barrido pointer-events-none"
          style={{
            width: 140,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)",
          }}
        />

        {/* Contenido */}
        <div className="relative flex flex-col justify-between w-full px-12 xl:px-16 py-12">

          {/* Encabezado */}
          <div className="entra-lat" style={{ "--retraso": "180ms" } as React.CSSProperties}>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full latido" style={{ background: "#0EA5E9" }} />
              Plataforma modular
            </span>
            <h2 className="text-white text-[34px] xl:text-[40px] font-bold leading-[1.1] tracking-tight mt-5 max-w-lg">
              Un CRM que se arma
              <br />
              con lo que tu operación
              <span style={{ color: "#0EA5E9" }}> sí necesita</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mt-4 max-w-md">
              Contratas los módulos que usas, y el panel los reúne todos en una sola lectura.
            </p>
          </div>

          {/* Rotador de módulos */}
          <div className="entra-lat max-w-lg" style={{ "--retraso": "300ms" } as React.CSSProperties}>
            <div
              className="rounded-2xl p-6 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {/* La key fuerza el reinicio de la animación en cada cambio */}
              <div key={slide} className="entra">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500"
                    style={{ background: d.color, color: "#fff" }}
                  >
                    {d.icono}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">{d.modulo}</span>
                </div>

                <p className="text-white text-lg font-bold leading-snug mt-4">{d.titular}</p>
                <p className="text-white/50 text-[13px] leading-relaxed mt-2">{d.detalle}</p>

                <div
                  className="flex items-baseline gap-2.5 mt-5 pt-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <span
                    className="text-2xl font-bold transition-colors duration-500"
                    style={{ color: d.color === "#2d4fa8" ? "#8aa9e8" : d.color }}
                  >
                    {d.dato}
                  </span>
                  <span className="text-[11px] text-white/40">{d.datoLabel}</span>
                </div>
              </div>
            </div>

            {/* Paginación */}
            <div className="flex items-center gap-2 mt-5">
              {diapositivas.map((x, i) => (
                <button
                  key={x.modulo}
                  onClick={() => setSlide(i)}
                  title={x.modulo}
                  className="h-1 rounded-full transition-all duration-500 cursor-pointer"
                  style={{
                    width: i === slide ? 34 : 14,
                    background: i === slide ? x.color : "rgba(255,255,255,0.22)",
                  }}
                />
              ))}
              <span className="ml-2 text-[10px] text-white/25">
                {slide + 1} / {diapositivas.length}
              </span>
            </div>
          </div>

          {/* Catálogo de módulos */}
          <div className="entra-lat" style={{ "--retraso": "420ms" } as React.CSSProperties}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Módulos disponibles</p>
            <div className="flex flex-wrap gap-2 max-w-xl">
              {catalogoModulos.map((m, i) => (
                <span
                  key={m.nombre}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${m.activo ? "flotar" : ""}`}
                  style={{
                    background: m.activo ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                    color: m.activo ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                    border: `1px solid ${m.activo ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)"}`,
                    animationDelay: `${i * 320}ms`,
                  }}
                >
                  {m.activo ? (
                    <svg viewBox="0 0 20 20" fill="#0EA5E9" className="w-3 h-3">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {m.nombre}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-white/25 mt-5">© 2026 Concept BPO · Meta Business Partner</p>
          </div>
        </div>
      </div>
    </div>
  )
}
