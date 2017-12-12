import {TypePerson} from 'backoffice-ace/src/app/client/shared/type-person.enum';
import {GeneralDataLegalPerson} from '../../legal-general-data/shared/general-data-legal';
import {Authorized} from '../../authorization/shared/authorization';
import {OficialDeCuentas} from '../../shared/client/oficial-de-cuentas';
import {Country} from '../../country/shared/country';
import {Referencia} from '../../shared/client/referencia';
export class Client {
  constructor(public tipoPersona?: TypePerson,
              public tipoIdentificacion?: any,
              public identificacion?: string,
              public tipoDocumento?: string,
              public documento?: string,
              public datosGeneralesPersonaNatural?: any,
              public datosGeneralesPersonaJuridica?: GeneralDataLegalPerson,
              public representanteLegalTutor?: any,
              public perfilEconomico?: any,
              public datosAdicionales?: any,
              public documentosApertura?: any,
              public direcciones?: any,
              public referencias?: Referencia,
              public oficialDeCuentas?: OficialDeCuentas,
              public paisOrigen?: Country,
              public clienteResumen?: any,
              public autorizaciones?: Authorized[],
              public nombre?: string) {}
}
