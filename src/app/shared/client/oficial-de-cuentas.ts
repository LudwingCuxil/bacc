/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
 import { SearchDataType } from 'security-angular/src/app/search';
 import { Injectable } from '@angular/core';

export class OficialDeCuentas {
    
    constructor(){
        this.descripcion ="";
    }
    
    public descripcion: string;
    public estado: string;
    public tipo: number;
    public id: IdOficialDeCuentas = new IdOficialDeCuentas();
}

export class IdOficialDeCuentas {
    codigo: number;
    codigoEmpresa: string;
}