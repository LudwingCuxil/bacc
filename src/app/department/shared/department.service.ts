import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from 'environments/environment';

@Injectable()
export class DepartmentService {

  private neighborhoodURL = environment.apiUrl;  // URL to web api

  constructor(private securityService: SecurityService) {
  }

  getDepartments(): Promise<any> {
    return this.securityService.get(this.neighborhoodURL + '/api/departamentos')
      .then(response => response.json())
      .catch(this.handleError);
  }

  getDepartmentsById(code: number): Promise<any> {
    return this.securityService.get(this.neighborhoodURL + '/api/departamentos?codigo=' + code)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}


