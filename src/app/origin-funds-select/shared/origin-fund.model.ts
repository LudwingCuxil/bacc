import { SearchDataType } from 'security-angular/src/app/search';

export class OriginFund{

  private dataType = SearchDataType;

  constructor(public codigo:number = 0,
              public descripcion:string = '',
              public anioApertura:number = 0,
              public mesApertura:number = 0,
              public diaApertura:number = 0,
              public usuario:string = ''){}

  public getFields(): string[]{
    return ['codigo', 'descripcion', 'anioApertura', 'mesApertura', 'diaApertura', 'usuario'];
  }

  public getHeaders(): string[]{
    return [
      'originfunds.codigo',
      'originfunds.descripcion',
      'originfunds.anioApertura',
      'originfunds.mesApertura',
      'originfunds.diaApertura',
      'originfunds.usuario'
    ];
  }

  public getDetails(): string{
    return '[{"name":"codigo"},{"name":"descripcion"},{"name":"anioApertura"},' +
      '{"name":"mesApertura"},{"name":"diaApertura"},{"name":"usuario"},]';
  }
}
