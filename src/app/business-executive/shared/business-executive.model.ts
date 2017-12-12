import { SearchDataType } from 'security-angular/src/app/search';

export class Id {
  constructor(public codigoEmpresa:string = '', public codigo:number = 0) {}
}
export class BusinessExecutive{

  constructor(public id: Id = new Id(), public descripcion:string = '', public estado:string = '',
              public tipo:number = 0){}

  getFields(): string[]{
    return ['codigoEmpresa', 'codigo', 'descripcion', 'estado', 'tipo'];
  }

  getHeaders(): string[]{
    return ['executive.codigoEmpresa', 'executive.codigo', 'executive.descripcion', 'executive.estado', 'executive.tipo'];
  }

  getDetails(): string{
    return '[{"name": "codigoEmpresa"}, {"name": "codigo"}, {"name": "descripcion"}, {"name": "estado"}, {"name": "tipo"}]';
  }

}
