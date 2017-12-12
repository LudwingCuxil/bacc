import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class BusinessExecutiveService {
  private businessExecutiveURL = environment.apiUrl + '/api/';

  constructor(private securityService: SecurityService) {
  }

  getBusinessExecutive(empresa: string, excludeClients = false, pager?: any): Promise<any> {
    return this.securityService.get(this.businessExecutiveURL + 'ejecutivosNegocio?empresa=' + empresa + '&excludeClientes=' + excludeClients)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
