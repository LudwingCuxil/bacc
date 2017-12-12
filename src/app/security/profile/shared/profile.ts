import {SearchDataType} from 'security-angular/src/app/search/search-data-type.enum';
import {Role} from '../../role/shared/role';
export class Profile {

  private static _dataType = SearchDataType;

  id: number;
  version = 0;
  nombre: string;
  descripcion: string;
  nivelAcceso = 0;
  rastreabilidad = 0;
  activo = false;
  roles: Role[] = [];

  static getFields(): string[] {
    return [
      'nombre',
      'descripcion',
      'activo'
    ];
  }

  public static getDataTypesFields(): SearchDataType[] {
    return [
      this._dataType.string,
      this._dataType.string,
      this._dataType.boolean
    ];
  }

  static getHeaders(): string[] {
    return [
      'profile.name',
      'profile.description'
    ];
  }

  static getDetails(): string {
    return '[{"name":"nombre"},{"name":"descripcion"}]';
  }
}
