/**
 * Created by oscar on 17/04/17.
 */
  import { SearchDataType } from 'security-angular/src/app/search';
 import { Injectable } from '@angular/core';
export class Sector {

  dataType = SearchDataType;
  
  constructor(public codigo?:string, public descripcion?:string){
      
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
      'sector.codigo',
      'sector.descripcion'
    ]
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"descripcion"}]'
  }

}
