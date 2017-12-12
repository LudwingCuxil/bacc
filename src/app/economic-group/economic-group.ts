import { Injectable } from '@angular/core';
export class EconomicGroup {
  
  constructor(public id?:EconomicGroupId, public descripcion?:string){
    this.id = new EconomicGroupId();
    this.descripcion = '-- NINGUNO --';
  }
}

export class EconomicGroupId {

  constructor(public tipoGrupo: number = 0, public grupo: number = 0){
  
  }
}
