import {Mode} from '../../shared/client/referenceDTO';
export class EconomicGroup {
  id: EconomicGroupId = new EconomicGroupId();
  descripcion: string;
  modalidad: Mode;
}

export class EconomicGroupId {
  tipoGrupo: number;
  grupo: number;
}
