export class Region {

  id: RegionId = new RegionId();
  descripcion: string;

}

export class RegionId {
  codigo: number;
  codigoPais: string;
}
