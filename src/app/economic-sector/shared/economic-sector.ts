 import { SearchDataType } from 'security-angular/src/app/search';
 import { Injectable } from '@angular/core';
export class EconomicSector {

  dataType = SearchDataType;

  constructor(public codigo:number = 0, public descripcion:string = ''){

  }

  public getFields() : string[]{
    return ['codigo', 'descripcion'];
  }

  getDataTypesFields() : SearchDataType[]{
    return [
      this.dataType.string,
      this.dataType.string];
  }

  getHeaders(): string[]{
    return [
      'economicSector.codigo',
      'economicSector.descripcion'
    ]
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"descripcion"}]'
  }

}



