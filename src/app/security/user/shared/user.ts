import {SearchDataType} from 'security-angular/src/app';

export class User {
  static dataType = SearchDataType;

  id: number;
  username: string;
  version: number;
  password: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  apellidoCasada: string;
  email: string;
  estado = false;
  passwordExpirado = false;
  sesionesMultiples = false;
  cuentaBloqueada = false;
  cuentaExpirada = false;
  credencialesExpiradas = false;
  caducaContrasenia = false;
  passwordReset = false;
  intentosFallidos = 0;
  codigoAntiguedad = 0;
  codigoCorporativo = 0;
  defaultProfileName: string;

  public static getFields(): string[] {
    return ['username',
      'primerNombre',
      'segundoNombre',
      'apellidoCasada',
      'primerApellido',
      'segundoApellido',
      'email',
      'estado'];
  }

  public static getDataTypesFields(): SearchDataType[] {
    return [
      this.dataType.string,
      this.dataType.string,
      this.dataType.string,
      this.dataType.string,
      this.dataType.string,
      this.dataType.string,
      this.dataType.string,
      this.dataType.boolean];
  }

  public static getHeaders(): string[] {
    return [
      'user.username',
      'user.first-name',
      'user.second-name',
      'user.married-name',
      'user.surname',
      'user.second-surname',
      'user.email'
    ];
  }

  public static getDetails(): string {
    return '[{"name":"username"},{"name":"primerNombre"},{"name":"segundoNombre"},{"name":"primerApellido"},{"name":"segundoApellido"},{"name":"email"}]';
  }
}
