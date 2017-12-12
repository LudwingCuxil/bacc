import {SearchDataType} from 'security-angular/src/app/search/search-data-type.enum';

export class User {
  static dataType = SearchDataType;

  id: number;
  version: number;
  username: string;
  password: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  email: string;
  telefonoEmpresa: string;
  telefonoPersonal: string;
  passwordHint: string;
  habilitado: boolean;
  cuentaExpirada: boolean;
  cuentaBloqueada: boolean;
  credencialesExpiradas: boolean;
  failedLoginAttempts: number;
  lastLogin: Date;
  lastPasswordChange: Date;
  lastPasswordReset: Date;
  passwordReset: boolean;
  created: Date;
  modified: Date;
  ip: string;
  defaultProfileName: string;
  caducaContrasenia: boolean;
  codigoAntiguedad: number;
  codigoCorporativo: number;
  sesionesMultiples: boolean;

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
