import { Cliente } from '../usuarios/cliente';
import { Sala } from '../sala';
import { TipoPago } from './tipo-pago';
import { Estado } from './estado'; 
export interface Reserva {
  id: number;              
  cliente: Cliente;       
  sala: Sala;              
  fechaInicio: string;      
  fechaFinal: string;       
  tipoPago: TipoPago;       
  estado: Estado;    
  googleEventId?: string;  
}
