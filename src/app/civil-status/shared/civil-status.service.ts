import { Injectable } from '@angular/core';
import { SecurityService } from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
import {DetailParameter} from './parameter';
@Injectable()
export class CivilStatusService {

  private civilStatusURL : string = environment.apiUrl+'/api/parametrosPlataforma/';  // URL to web api

  constructor(private securityService: SecurityService) { }

  getCivilStatus(code : string): Promise<any> {
    return this.securityService.get(this.civilStatusURL+code)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
