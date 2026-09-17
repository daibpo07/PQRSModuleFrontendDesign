import { marca } from "../marca"

/* Etiqueta de vidrio oscuro con un punto de color, para rótulos que flotan en 3D */

interface Props {
  texto: string
  color: string
  detalle?: string
  tamano?: number
}

export default function Chip3D({ texto, color, detalle, tamano = 24 }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: tamano * 0.5,
        padding: `${tamano * 0.5}px ${tamano * 0.9}px`,
        borderRadius: 999,
        whiteSpace: "nowrap",
        background: "rgba(8, 17, 45, 0.78)",
        border: `1px solid ${color}88`,
        boxShadow: `0 0 40px -6px ${color}aa, inset 0 0 20px -8px ${color}`,
        color: marca.texto,
        fontSize: tamano,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: tamano * 0.45,
          height: tamano * 0.45,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 14px ${color}`,
        }}
      />
      {texto}
      {detalle && (
        <span style={{ fontSize: tamano * 0.62, fontWeight: 500, color: marca.textoSuave, fontFamily: "monospace" }}>
          {detalle}
        </span>
      )}
    </div>
  )
}
