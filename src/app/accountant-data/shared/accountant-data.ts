/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * Created by oscar on 17/04/17.
 */
  import { SearchDataType } from 'security-angular/src/app/search';
 import { Injectable } from '@angular/core';
export class AccountantData {

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
      'accountantData.codigo',
      'accountantData.descripcion'
    ]
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"descripcion"}]'
  }

}


