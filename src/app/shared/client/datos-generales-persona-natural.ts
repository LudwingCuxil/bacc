/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {Nacionalidad} from './nacionalidad';
import {Profesion} from './profesion';

export class DatosGeneralesPersonaNatural {

  apellidoCasada = '';
  conyuge = '';
  dependientes = 0;
  estadoCivil: string;
  fechaNacimientoCreacion: Date;
  genero = 'F';
  nacionalidad = new Nacionalidad();
  numeroLicencia = '';
  paisResidencia = new Nacionalidad();
  perfilCuentaBasica: boolean;
  primerApellido: string;
  primerNombre: string;
  segundoApellido = '';
  segundoNombre = '';
  profesion = new Profesion();
}



