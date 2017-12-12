import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class AddressZoneService {

  private zonesURL = environment.apiUrl;

  constructor(private securityService: SecurityService) {
  }

  getZones(pager?: any): Promise<any> {
    return this.securityService.get(this.zonesURL + '/api/zonas')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}


