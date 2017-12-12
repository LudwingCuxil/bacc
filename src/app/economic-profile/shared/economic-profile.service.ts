import { Injectable } from '@angular/core';
import "rxjs/add/operator/toPromise";

import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
//import {GeneralDataLegalPerson} from './general-data-natural';
import {ClienteDto} from '../../shared/client/cliente-dto';


@Injectable()
export class EconomicProfileService {

  private generalDataLegalURL : string =  environment.apiUrl + '/api/clientes/';

  constructor(private securityService : SecurityService){}

  getEconomicProfile(identification: string) : Promise<ClienteDto>{
    return this.securityService.get(this.generalDataLegalURL+identification+'/cambio/perfilEconomico')
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  putEconomicProfile(clientDto : ClienteDto, identification: string) : Promise<ClienteDto>{
      let body = JSON.stringify(clientDto);
      return this.securityService.put(this.generalDataLegalURL+identification+'/perfilEconomico', body)
        .then((response) => response.json() as ClienteDto)
        .catch(this.handleError);
    }


  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
