import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';


@Injectable()
export class TypeInstitutionService {

  // private sectorSeviceURL = 'http://localhost:8080/services/api/';  // URL to web api
  private sectorSeviceURL = environment.apiUrl + '/api/';  // URL to web api

  constructor(private securityService: SecurityService, private http: Http) {
  }


  getTypeInstitutionService(pager?: any): Promise<any> {
    return this.securityService.get(this.sectorSeviceURL + 'tiposInstituciones')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
