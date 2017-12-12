/**
 * Created by elioth010 on 6/6/17.
 */
import {Injectable} from '@angular/core';

import {SecurityService} from 'security-angular/src/app';
import {environment} from '../../../environments/environment';
import {ClienteDto} from '../../shared/client/cliente-dto';

@Injectable()
export class GeneralInformationService {

  private generalInformationURL: string = environment.apiUrl;

  constructor(private securityService: SecurityService) {
  }

  getRiskLevel(region, department, municipality, neighborhood): Promise<any> {
    return this.securityService.get(this.generalInformationURL + '/api/nivelRiesgo?region=' + region + '&departamento=' + department + '&municipio=' + municipality + '&barrio=' + neighborhood)
      .then(response => response.json())
      .catch(this.handleError);
  }

  getAddressByClient(identification): Promise<any> {
    return this.securityService.get(this.generalInformationURL + '/api/clientes/' + identification + '/cambio/direcciones')
      .then(response => response.json())
      .catch(this.handleError);
  }

  putAddress(client: ClienteDto, identification: string): Promise<ClienteDto> {
    const body = JSON.stringify(client);
    return this.securityService.put(this.generalInformationURL + '/api/clientes/' + identification + '/direcciones', body)
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  getReferencesByClient(identification): Promise<any> {
    return this.securityService.get(this.generalInformationURL + '/api/clientes/' + identification + '/cambio/referencias')
      .then(response => response.json())
      .catch(this.handleError);
  }

  existsAddressAssociatedToAccount(identificacion, codeAddress): Promise<any> {
    return this.securityService.post(this.generalInformationURL + '/api/clientes/validateAddressToDelete?identificacion=' + identificacion + '&correlativoDireccion=' + codeAddress)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
