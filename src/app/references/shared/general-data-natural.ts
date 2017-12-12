import {Genres} from './genres.enum';
import {CivilStatus} from '../../civil-status/shared/civil-status.enum';
import {Country} from '../../country/shared/country';
import {Profession} from '../../profession/shared/profession';
export class GeneralDataNaturalPerson {
  constructor(public genero?: Genres,
              public estadoCivil?: CivilStatus,
              public perfilCuentaBasica?: boolean,
              public primerApellido?: string,
              public segundoApellido?: string,
              public apellidoCasada?: string,
              public primerNombre?: string,
              public segundoNombre?: string,
              public conyuge?: string,
              public fechaNacimientoCreacion?: Date,
              public nacionalidad?: Country,
              public paisResidencia?: Country,
              public profesion?: Profession,
              public dependientes?: number,
              public numeroLicencia?: string){}
}