export class ServicioElectronico{
  acepta = false;
  id = null;
  nombre = '';
  tipoPersona = PersonType;
  version = 0;
}
export enum PersonType {
  N,
  J,
  A
}