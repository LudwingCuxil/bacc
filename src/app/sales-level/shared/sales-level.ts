import { Injectable } from '@angular/core';
import { SearchDataType } from 'security-angular/src/app/search';

export class SalesLevel {

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
      'salesLevel.codigo',
      'salesLevel.descripcion'
    ]
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"descripcion"}]'
  }

}
