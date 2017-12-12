import { SearchDataType } from 'security-angular/src/app/search';

export class Id {
  constructor(public codigo: number = null,public empresa: string = '') {}
}
export class Agency{
  constructor(public empresa:string = '', public id: Id = new Id(), public apartadoPostal:string = '',
              public direccion:string = '', public fax:string = '', public horarioAgencia:string = '', public jefe:string = '',
              public nivelGeografico1:string = '', public nivelGeografico2:string = '', public nivelGeografico3:string = '',
              public nivelGeografico4:string = '', public nombre:string = '', public nombre2:string = '', public pais:string = '',
              public telefono:string = '', public telefono1:string = '', public telefono2:string = '', public tipoReserva:string = ''){}
}
