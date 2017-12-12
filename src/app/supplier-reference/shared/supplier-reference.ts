/**
 * Created by oscar on 17/04/17.
 */
import {SearchDataType} from 'security-angular/src/app/search';
export class SupplierReference {

  dataType = SearchDataType;

  constructor(public codigo?: string, public descripcion?: string) {

  }

  public getFields(): string[] {
    return ['codigo', 'descripcion'];
  }

  getDataTypesFields(): SearchDataType[] {
    return [
      this.dataType.string,
      this.dataType.string];
  }

  getHeaders(): string[] {
    return [
      'supplierRerference.codigo',
      'supplierRerference.descripcion'
    ]
  }

  getDetails(): string {
    return '[{"name":"codigo"},{"name":"descripcion"}]'
  }

}
