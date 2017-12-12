import {Currency} from '../../currency-select/shared/currency.model';
import {PlParameter} from '../../pl-parameter/shared/pl-parameter';
import {Beneficiario} from './beneficiary';
import {BeneficiarioFinal} from './final-beneficiary';
import {DatoChequera} from './checkbook-data';
import {DatoGeneral} from './data-general';
import {DatoInteres} from './data-interest';
import {Firma} from './sign';
import {ServicioElectronico} from './electronic-service';
import {PersonaMancomunada} from './person-joint';
import {PlazoFijo} from './fixed-term';
import {ClienteResumen} from '../client/cliente-resumen';
import {ClientInformation} from './client-information.model';
import {AccountResponse} from './account-response';
import {ProductType} from '../../type-product-select/shared/product-type.model';
import {Product} from './product';
import {Mode} from '../client/referenceDTO';
import { AccountSummary } from './account-summary';

export class AccountDto {
  beneficiarios: Beneficiario[] = [];
  beneficiariosFinales: BeneficiarioFinal[] = [];
  datoChequera = new DatoChequera();
  datoGeneral = new DatoGeneral();
  datoInteres = new DatoInteres();
  firma = new Firma();
  moneda: Currency = new Currency();
  personasAsociadas: PersonaMancomunada[] = [];
  plazoFijo = new PlazoFijo();
  cliente: ClienteResumen = new ClienteResumen();
  clienteEsBeneficiarioFinal = false;
  producto: Product = new Product();
  serviciosElectronicos: ServicioElectronico[] = [];
  tipoProducto: ProductType = new ProductType();
  digitoIdentificador: number = 0;
  agencia: number = 0;
  correlativo: number = 0;
  digitoVerificador: number = 0;
  autorizaciones: any[] = [];
  modalidad: Mode;
  subProducto: any;
  clientInformation: ClientInformation = new ClientInformation();
  accountResponse: AccountResponse = new AccountResponse();
  business: PlParameter = new PlParameter();
  cuentasTraslados: AccountSummary[] = [];
}

export class RelationshipAccount {
  modalidad: Mode;
}
