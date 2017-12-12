import { Injectable } from '@angular/core';
import { SearchDataType } from 'security-angular/src/app/search';

export class TypeSociety {

  dataType = SearchDataType;
  
  constructor(public codigo?:number, public descripcion?:string){
      
  }

  public getFields() : string[]{
    return ['codigo', 'descripcion'];
  }

  getDataTypesFields() : SearchDataType[]{
    return [
      this.dataType.integer,
      this.dataType.string];
  }
  getHeaders(): string[]{
    return [
      'typeSociety.codigo',
      'typeSociety.descripcion'
    ]
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"descripcion"}]'
  }

}

