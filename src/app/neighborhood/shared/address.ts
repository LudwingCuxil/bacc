import {SearchDataType} from 'security-angular/src/app/search';

export class Address {

  dataType = SearchDataType;
  id?: number;
  codigoPais04?: string;
  nivelGeografico41?: number;
  nivelGeografico42?: number;
  nivelGeografico43?: number;
  nivelGeografico44?: number;
  nombreLugar4?: string;
  abrebiatura4?: string;
  codigoPais03?: string;
  nivelGeografico31?: number;
  nivelGeografico32?: number;
  nivelGeografico33?: number;
  nombreLugar3?: string;
  abrebiatura3?: string;
  codigoPais02?: string;
  nivelGeografico21?: number;
  nivelGeografico22?: number;
  nombreLugar2?: string;
  abrebiatura2?: string;
  codigoPais01?: string;
  nivelGeografico01?: string;
  nombreLugar1?: string;

  constructor(id?: number, codigoPais04?: string, nivelGeografico41?: number, nivelGeografico42?: number, nivelGeografico43?: number,
              nivelGeografico44?: number, nombreLugar4?: string, abrebiatura4?: string, codigoPais03?: string, nivelGeografico31?: number,
              nivelGeografico32?: number, nivelGeografico33?: number, nombreLugar3?: string, abrebiatura3?: string, codigoPais02?: string,
              nivelGeografico21?: any, nivelGeografico22?: any, nombreLugar2?: string, abrebiatura2?: string, codigoPais01?: string, nivelGeografico01?: string,
              nombreLugar1?: string) {
    this.id = id;
    this.codigoPais04 = codigoPais04;
    this.nivelGeografico41 = nivelGeografico41;
    this.nivelGeografico42 = nivelGeografico42;
    this.nivelGeografico43 = nivelGeografico43;
    this.nivelGeografico44 = nivelGeografico44;
    this.nombreLugar4 = nombreLugar4;
    this.abrebiatura4 = abrebiatura4;
    this.codigoPais03 = codigoPais03;
    this.nivelGeografico31 = nivelGeografico31;
    this.nivelGeografico32 = nivelGeografico32;
    this.nivelGeografico33 = nivelGeografico33;
    this.nombreLugar3 = nombreLugar3;
    this.abrebiatura3 = abrebiatura3;
    this.codigoPais02 = codigoPais02;
    this.nivelGeografico21 = nivelGeografico21;
    this.nivelGeografico22 = nivelGeografico22;
    this.nombreLugar2 = nombreLugar2;
    this.abrebiatura2 = abrebiatura2;
    this.codigoPais01 = codigoPais01;
    this.nivelGeografico01 = nivelGeografico01;
    this.nombreLugar1 = nombreLugar1;
  }
}
