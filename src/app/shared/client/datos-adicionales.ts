/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
export class DatosAdicionales {

  numeroIdentificacion = '';
  tipoDatoAdicional: AdditionalDatatype = null;

  static getCode(): string[] {
    return JSON.parse('[{"description":"Matr\u00edcula Gratis", "code": "MATRICULA_GRATIS"},{"description":"Ente Gubernamental", ' +
      '"code":"ENTE_GUBERNAMENTAL"},{"description":"Otros", "code":"OTROS"}]');
  }
}

export enum AdditionalDatatype {
  MATRICULA_GRATIS,
  ENTE_GUBERNAMENTAL,
  OTROS
}
