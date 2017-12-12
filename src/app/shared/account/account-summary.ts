import {AccountId} from './account-id';
import {AccountRelationship} from './account-relationship.enum';

export class AccountSummary {
  constructor(public id: AccountId = new AccountId(),
              public numeroCuenta: string = '',
              public nombre: string = '',
              public tipoProducto: number = 0,
              public subProduco: number = 0,
              public moneda: string = '',
              public estado: string = '',
              public tipoDocumento: string = '',
              public documento: string = '',
              public tipoDocumentoTutor: string = '',
              public documentoTutor: string = '',
              public saldoTotal: number = 0,
              public saldoDisponible: number = 0,
              public relacion: AccountRelationship = AccountRelationship.TITULAR,
              public descripcionTipoProducto: string = '',
              public descripcionSubProducto: string = '',
              public descripcionEstado: string = '',) {
  }
}
