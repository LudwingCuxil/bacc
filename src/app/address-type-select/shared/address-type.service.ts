/**
 * Created by elioth010 on 6/7/17.
 */
import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class AddressTypeService {

  private municipalityURL = environment.apiUrl;

  constructor(private securityService: SecurityService) {
  }

  getAddressTypes(): Promise<any> {
    return this.securityService.get(this.municipalityURL + '/api/tipoDirecciones')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}

