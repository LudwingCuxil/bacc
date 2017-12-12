import {SearchDataType} from 'security-angular/src/app/search/search-data-type.enum';

export class Role {

  private static _dataType = SearchDataType;

  id: number;
  nombre: string;
  version: number;
  descripcion: string;
  tipo: any;

  static getFields(): string[] {
    return ['nombre',
      'descripcion'];
  }

  static getDataTypesFields(): SearchDataType[] {
    return [
      this._dataType.string,
      this._dataType.string];
  }

  static getHeaders(): string[] {
    return [
      'role.name',
      'role.description'
    ];
  }

  static getDetails(): string {
    return '[{"name":"nombre"},{"name":"descripcion"}]';
  }

  constructor(id?: number, nombre?: string, version?: number, descripcion?: string) {
    this.id = id;
    this.nombre = nombre;
    this.version = version;
    this.descripcion = descripcion;
  }
}

export enum TypeRole {
  FUN = <any>'FUN',
  MOD = <any>'MOD'
}
