export interface SalaDTO {
  id: number;
  numero: number;
  descripcion: string;
  cantidad_personas: number; // ← número, no string
}
