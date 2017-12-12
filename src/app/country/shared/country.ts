import {Moneda} from "../../shared/client/moneda";
export class Country {

  constructor(public codigo: string = '', public nombre: string = '', public moneda: Moneda = new Moneda(), public nacionalidad: string = '') {

  }

  public getFields(): string[] {
    return ['codigo', 'nombre', 'nacionalidad'];
  }

  getHeaders(): string[] {
    return [
      'country.codigo',
      'country.nombre',
      'country.nacionalidad'
    ];
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"nombre"},{"name":"nacionalidad"}]';
  }

}



