import { Injectable } from '@angular/core';
import "rxjs/add/operator/toPromise";

import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
//import {GeneralDataLegalPerson} from './general-data-natural';
import {ClienteDto} from '../../shared/client/cliente-dto';

import {Parentesco} from '../../shared/client/parentesco';

@Injectable()
export class GeneralDataLegalService {

  private generalDataLegalURL : string = environment.apiUrl + '/api/clientes/';

  constructor(private securityService : SecurityService){}

  getGeneralDataLegal(identification: string) : Promise<ClienteDto>{
    return this.securityService.get(this.generalDataLegalURL+identification+'/cambio/datosGenerales')
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  putGeneralDataLegal(clientDto : ClienteDto, identification: string) : Promise<ClienteDto>{
      let body = JSON.stringify(clientDto);
      return this.securityService.put(this.generalDataLegalURL+identification+'/datosGenerales', body)
        .then((response) => response.json() as ClienteDto)
        .catch(this.handleError);
    }

  getRelationship() : Promise<Parentesco>{
      return this.securityService.get(environment.apiUrl+'/api/parentescos')
          .then((response) => response.json() as Parentesco)
          .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
