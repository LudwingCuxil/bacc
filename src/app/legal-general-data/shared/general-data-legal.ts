import{TypeSociety} from '../../type-society/shared/type-society'; 
import {LevelSales} from './level-sales';
export class GeneralDataLegalPerson {
  constructor(public razonSocial?: string,
              public nombreComercial?: string,
              public siglas?: string,
              public tipoSociedad?: TypeSociety,
              public nivelVentas?: LevelSales,
              public enFormacion?: boolean,
              public fechaRegistro?: Date,
              public fechaInicioOperaciones?: Date,
              public registroMercantilNumero?: string,
              public registroMercantilTomo?: string,
              public registroMercantilPagina?: string,
              public numeroEscrituraPermisoOperaciones?: string,
              public patenteComercio?: string,
              public puntoActa?: string) {}
}