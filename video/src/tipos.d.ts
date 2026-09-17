/* La app importa imágenes a través de Vite; aquí basta con declararlas */
declare module "*.png" {
  const src: string
  export default src
}
