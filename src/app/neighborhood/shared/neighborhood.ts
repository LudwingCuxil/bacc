/**
 * Created by elioth010 on 6/5/17.
 */
export class Neighborhood {
  id: NeighborhoodId = new NeighborhoodId();
  descripcion: string;
  abreviatura: string;
}

export class NeighborhoodId {
  codigoPais: string;
  codigoRegion: number;
  codigoDepartamento: number;
  codigoMunicipio: number;
  codigo: number;
}
