import { Injectable } from '@angular/core';
import "rxjs/add/operator/toPromise";
import {Authorization, AuthorizationResponse} from './authorization';

import {SecurityService} from 'security-angular/src/app/security';
//import {ClientInformation} from '../../shared/client-information.model';
import {environment} from '../../../environments/environment';

@Injectable()
export class AuthorizationService {

  private authorizationURL : string = environment.apiUrl + '/api/autorizaciones/';

  constructor(private securityService : SecurityService){}
  
  applyFor(authorization: Authorization) : Promise<any>{
    let body = JSON.stringify(authorization);
    return this.securityService.post(this.authorizationURL+'solicitar', body)
      .then(response => response.json() as any)
      .catch(this.handleError);
  }
    
  check(authorization: AuthorizationResponse) : Promise<any>{
    let body = JSON.stringify(authorization);
    return this.securityService.post(this.authorizationURL+'revisar', body)
      .then(response => response.json() as any)
      .catch(this.handleError);
  }
    
  cancel(authorization: AuthorizationResponse) : Promise<any>{
    let body = JSON.stringify(authorization);
    return this.securityService.post(this.authorizationURL+'cancelar', body)
      .then(response => response.json() as any)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    if (error.status == 428) {
      return JSON.parse(error._body);
    }
    if (error.status == 403){
      return Promise.reject(JSON.parse(error._body));
    }
    return Promise.reject(error.message || error);
  }
}
