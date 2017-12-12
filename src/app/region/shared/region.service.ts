import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class RegionService {

  private regionURL = environment.apiUrl;

  constructor(private securityService: SecurityService) { }

  getRegions(): Promise<any> {
    return this.securityService.get(this.regionURL + '/api/regiones')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}

