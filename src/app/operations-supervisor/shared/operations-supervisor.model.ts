import { SearchDataType } from 'security-angular/src/app/search';
export class Id {
  constructor(public codigoEmpresa:string = '', public codigo:number = 0) {}
}
export class OperationsSupervisor{
  private dataType = SearchDataType;

  constructor(public id: Id = new Id(), public nivel:number = 0, public nombre:string = '', public direccion:string = '',
              public telefono:string = '', public estado:string = '', public claveEncriptada:number = 0, public diasExpiracionPassword:number = 0,
              public diaUltimoCambio:number = 0, public mesUltimoCambio:number = 0, public anioUltimoCambio:number = 0, public codigoUsuario:string = ''){}

  getFields(): string[]{
    return ['codigoEmpresa', 'codigo', 'nivel', 'nombre', 'direccion', 'telefono', 'estado', 'claveEncriptada', 'diasExpiracionPassword',
    'diaUltimoCambio', 'mesUltimoCambio', 'anioUltimoCambio', 'codigoUsuario'];
  }

  getHeaders(): string[]{
    return ['supervisor.codigoEmpresa', 'supervisor.codigo','supervisor.nivel','supervisor.nombre','supervisor.direccion','supervisor.telefono',
      'supervisor.estado','supervisor.claveEncriptada','supervisor.diasExpiracionPassword','supervisor.diaUltimoCambio','supervisor.mesUltimoCambio',
      'supervisor.anioUltimoCambio','supervisor.codigoUsuario'];
  }

  getDetails(): string{
    return '[{"name": "codigoEmpresa"},{"name": "codigo"},{"name": "nivel"},{"name": "nombre"},{"name": "direccion"},{"name": "telefono"},' +
      '{"name": "estado"},{"name": "claveEncriptada"},{"name": "diasExpiracionPassword"},{"name": "diaUltimoCambio"},{"name": "mesUltimoCambio"},' +
      '{"name": "anioUltimoCambio"},{"name": "codigoUsuario"}]'
  }

}
