/**
 * Created by elioth010 on 6/12/17.
 */
import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
import {ClienteDto} from '../client/cliente-dto';

@Injectable()
export class SaveService {

  private saveServiceURL = environment.apiUrl + '/api/';  // URL to web api


  constructor(private securityService: SecurityService) {
  }

  saveClient(client: ClienteDto, company: number): Promise<any> {
    const body = JSON.stringify(client);
    return this.securityService.post(this.saveServiceURL + 'clientes/save?empresa=' + company, body)
      .then(response => response.json())
      .catch(this.handleError);
  }


  saveReferences(client: ClienteDto, company: number): Promise<any> {
    const body = JSON.stringify(client);
    return this.securityService.post(this.saveServiceURL + 'clientes/saveReferencias?empresa=' + company, body)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
