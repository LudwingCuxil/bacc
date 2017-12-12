import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class MunicipalityService {

  private municipalityURL = environment.apiUrl;

  constructor(private securityService: SecurityService) {
  }

  getMunicipalities(): Promise<any> {
    return this.securityService.get(this.municipalityURL + '/api/municipios')
      .then(response => response.json())
      .catch(this.handleError);
  }

  getMunicipalityById(code: number): Promise<any> {
    return this.securityService.get(this.municipalityURL + '/api/municipios?codigo=' + code)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}

