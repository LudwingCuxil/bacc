import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import {environment} from '../../../environments/environment';

import {SecurityService} from 'security-angular/src/app';
@Injectable()
export class GroupService {

  private groupURL = environment.apiUrl + '/api/';  // URL to web api

  constructor(private securityService: SecurityService, private http: Http) {
  }

  getGroups(): Promise<any> {
    return this.securityService.get(this.groupURL + 'gruposEconomicos')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
