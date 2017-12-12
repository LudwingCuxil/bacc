/**
 * Created by elioth010 on 6/6/17.
 */
import {Injectable} from '@angular/core';

import {SecurityService} from 'security-angular/src/app';
import {environment} from '../../../../environments/environment';

@Injectable()
export class VehicleService {

  private shareholderURL: string = environment.apiUrl;

  constructor(private securityService: SecurityService) {
  }

  getReferences(): Promise<any> {
    return this.securityService.get(this.shareholderURL + '/api/')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
