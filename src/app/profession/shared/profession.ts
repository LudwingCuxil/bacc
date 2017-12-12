import { Injectable } from '@angular/core';
import { SearchDataType } from 'security-angular/src/app/search';

export class Profession {

  dataType = SearchDataType;
  
  constructor(public id?: number, public descripcion?:string){
      
  }

  public getFields() : string[]{
    return ['id', 'descripcion'];
  }

  getDataTypesFields() : SearchDataType[]{
    return [
      this.dataType.integer,
      this.dataType.string];
  }
  getHeaders(): string[]{
    return [
      'profession.id',
      'profession.descripcion'
    ]
  }

  getDetails(): string {
    return '[{"name":"id"},{"name":"descripcion"}]'
  }

}
