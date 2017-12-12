export class Department {
  id: DepartmentId = new DepartmentId();
  descripcion: string;
  abreviatura: string;
}

export class DepartmentId {
  codigoPais: string;
  codigoRegion: number;
  codigo: number;
}
