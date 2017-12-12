/**
 * Created by oscar on 17/04/17.
 */
 import { SearchDataType } from 'security-angular/src/app/search';
 import { Injectable } from '@angular/core';
export class ClassCustomer {

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
      'classCustomer.codigo',
      'classCustomer.descripcion'
    ]
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"descripcion"}]'
  }

}



