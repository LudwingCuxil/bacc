import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';


@Injectable()
export class InstitutionService {

  // private institutionSeviceURL = 'http://localhost:8080/services/api/';  // URL to web api
  private institutionSeviceURL = environment.apiUrl + '/api/';  // URL to web api

  constructor(private securityService: SecurityService, private http: Http) {
  }

//  getInstitutionService(pager?:any): Promise<any> {
//    return this.http.get(this.institutionSeviceURL+"instituciones").toPromise()
//      .then(response => response.json())
//      .catch(this.handleError);
//  }

  getInstitutionService(types?: string): Promise<any> {
    let tipo = '';
    if (types) {
      tipo = '?tipo=' + types;
    }
    return this.securityService.get(this.institutionSeviceURL + 'instituciones' + tipo)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
