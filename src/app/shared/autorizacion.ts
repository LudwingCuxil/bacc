/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
export class Autorizacion {

  private _permiso: string;
  private _seccion: string;

  constructor(permiso?: string, seccion?: string) {
    this._permiso = permiso;
    this._seccion = seccion;
  }

  get permiso(): string {
    return this._permiso;
  }

  set permiso(value: string) {
    this._permiso = value;
  }

  get seccion(): string {
    return this._seccion;
  }

  set seccion(value: string) {
    this._seccion = value;
  }
}


