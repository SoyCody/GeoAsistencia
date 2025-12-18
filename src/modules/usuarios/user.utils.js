export function generarCodigo() {
  const numero = Math.floor(1000 + Math.random() * 9000);
  return `EMP-${numero}`;
}
