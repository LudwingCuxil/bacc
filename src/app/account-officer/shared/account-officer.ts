import { SearchDataType } from 'security-angular/src/app/search';

class Id {
  codigoEmpresa: string;
  codigo: string;
}

export class AccountOfficer {

  dataType = SearchDataType;

  
  constructor(public id?:string, public descripcion?:string,public estado?:string,public tipo?:number){
      
  }

  public getFields() : string[]{
    return ['id', 'descripcion','estado','tipo'];
  }

  getDataTypesFields() : SearchDataType[]{
    return [
      this.dataType.string,
      this.dataType.string,
      this.dataType.string,
      this.dataType.integer];
  }
  getHeaders(): string[]{
    return [
      'accountOfficer.id',
      'accountOfficer.descripcion',
      'accountOfficer.estado',
      'accountOfficer.tipo'
    ]
  }

  getDetails(): string {
    return '[{"name":"id"},{"name":"descripcion"},{"name":"estado"},{"name":"tipo"}]'
  }

}
