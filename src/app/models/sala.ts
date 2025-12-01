export type SalaSize = 'PEQUEÑA' | 'MEDIANA' | 'GRANDE';
export interface SalaDTO {
  id: number;
  numero: number;
  salaSize: SalaSize;
  descripcion: string;
  cantidad_personas: number; // ← número, no string
}

// Para crear una sala NO necesitamos id ni cantidad_personas
 export type CreateSalaDTO = Omit<SalaDTO, 'id'>;
