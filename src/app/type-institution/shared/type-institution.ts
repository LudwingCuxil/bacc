  import { SearchDataType } from 'security-angular/src/app/search';
 import { Injectable } from '@angular/core';
export class TypeInstitution {

  dataType = SearchDataType;
  
  constructor(public codigo?:string, public descripcion?:string,public indicador?:string, public puedeTenerTC?:string){
      
  }

  public getFields() : string[]{
    return ['codigo', 'descripcion','indicador','puedeTenerTC'];
  }


  getDataTypesFields() : SearchDataType[]{
    return [
      this.dataType.string,
      this.dataType.string,
      this.dataType.string,
      this.dataType.string];
  }
  getHeaders(): string[]{
    return [
      'typeInstitution.codigo',
      'typeInstitution.descripcion',
      'typeInstitution.indicador',
      'typeInstitution.puedeTenerTC'
    ]
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"descripcion"},{"name":"indicador"},{"name":"puedeTenerTC"}]'
  }

}