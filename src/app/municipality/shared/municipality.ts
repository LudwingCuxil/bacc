export class Municipality {
  id: MunicipalityId = new MunicipalityId();
  descripcion: string;
  abreviatura: string;
}

export class MunicipalityId {
  codigoPais: string;
  codigoRegion: number;
  codigoDepartamento: number;
  codigo: number;
}
