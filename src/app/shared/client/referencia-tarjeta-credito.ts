/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {ReferenceDTO} from './referenceDTO';
export class ReferenciaTarjetaCredito extends ReferenceDTO {
  empresaEmisora: string;
  fechaConcesion: Date;
  fechaVencimiento: Date;
  guardada: boolean;
  limite: number;
  numeroTarjeta: string;
  telefono = '';
}



