import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';


@Injectable()
export class CountryService {

  private countryURL = environment.apiUrl + '/api/';  // URL to web api

  constructor(private securityService: SecurityService, private http: Http) {
  }

  getcountryService(pager?: any): Promise<any> {
    return this.securityService.get(this.countryURL + 'paisesOrigen')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}

