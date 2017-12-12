import {Injectable} from '@angular/core';
import 'rxjs/add/operator/toPromise';

import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

import {Parentesco} from '../../shared/client/parentesco';
import {ClienteDto} from '../../shared/client/cliente-dto';
import {PersonRegistry} from './person-registry';

@Injectable()
export class GeneralDataNaturalService {

  private generalDataNaturalURL: string = environment.apiUrl + '/api/clientes/';

  constructor(private securityService: SecurityService) {
  }

  getGeneralDataNatural(identification: string): Promise<ClienteDto> {
    return this.securityService.get(this.generalDataNaturalURL + identification + '/cambio/datosGenerales')
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  putGeneralDataNatural(client: ClienteDto, identification: string): Promise<ClienteDto> {
    const body = JSON.stringify(client);
    return this.securityService.put(this.generalDataNaturalURL + identification + '/datosGenerales', body)
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  getPersonRegistryInfo(identificationType: string, identification: string): Promise<PersonRegistry> {
    return this.securityService.get(this.generalDataNaturalURL + 'registroPersonas?tipoIdentificacion=' + identificationType + '&numeroIdentificacion=' + identification)
      .then((response) => response.json() as PersonRegistry)
      .catch(this.handleError);
  }

  authorizeChangePersonRegistry(): Promise<any> {
    return this.securityService.get(this.generalDataNaturalURL + 'registroPersonas/autorizaciones')
      .then((response) => response.json())
      .catch(this.handleError);
  }

  getRelationship(): Promise<Parentesco> {
    return this.securityService.get(environment.apiUrl + '/api/parentescos')
      .then((response) => response.json() as Parentesco)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
