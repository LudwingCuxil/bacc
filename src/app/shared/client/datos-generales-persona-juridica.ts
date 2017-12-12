/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {
  NivelVentas
} from './nivel-ventas'
  ;
import {TipoSociedad} from './tipo-sociedad';
export class DatosGeneralesPersonaJuridica {

  enFormacion = false;
  fechaInicioOperaciones: Date;
  fechaRegistro: Date;
  nivelVentas: NivelVentas;
  nombreComercial: string;
  numeroEscrituraPermisoOperaciones = '';
  patenteComercio = '';
  puntoActa = '';
  razonSocial: string;
  registroMercantilNumero = '';
  registroMercantilPagina = '';
  registroMercantilTomo = '';
  siglas: string ='';
  tipoSociedad: TipoSociedad = new TipoSociedad();

  constructor() {
  }


}

