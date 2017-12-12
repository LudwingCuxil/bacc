import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {SecurityService} from 'security-angular/src/app/';

@Injectable()
export class ClientUpdateService {

  private changeURL = environment.apiUrl + '/api/clientes/';  // URL to web api


  constructor(private securityService: SecurityService) {
  }

  getClientInfo(identification: string): Promise<any> {
    return this.securityService.get(this.changeURL + identification + '/seccionesPendientes')
      .then(response => response.json())
      .catch(this.handleError);
  }
  
  validEconomicProfile(identification: string) : Promise<any> {
    return this.securityService.get(this.changeURL + identification + '/resumenSeccionesPendientes')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
