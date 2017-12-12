import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Role} from './role';
import 'rxjs/add/operator/toPromise';

import {SecurityService} from 'security-angular/src/app/security/shared/security.service';
import {SearchEntity} from 'security-angular/src/app/search/search.model';
import {environment} from '../../../../environments/environment';

@Injectable()
export class RoleService {
  private roleURL: string = environment.apiUrl + '/api/roles';  // URL to web api

  constructor(private securityService: SecurityService) {
  }

  getRoles(pager?: any): Promise<any> {
    return this.securityService.get(this.roleURL + this.securityService.getPagerURL(pager))
      .then(response => response.json())
      .catch(this.handleError);
  }

  getDetailRole(id: number): Promise<Role> {
    return this.securityService.get(this.roleURL + '/' + id)
      .then(response => response.json() as Role)
      .catch(this.handleError);
  }

  searchRoles(role: SearchEntity, pager?: any): Promise<any> {
    const body = JSON.stringify(role);
    return this.securityService.post(this.roleURL + '/findAll' + this.securityService.getPagerURL(pager), body)
      .then(response => response.json())
      .catch(this.handleError);

  }

  createRole(role: Role): Promise<Role> {
    const body = JSON.stringify(role);
    return this.securityService.post(this.roleURL, body)
      .then(response => response.json() as Role)
      .catch(this.handleError);
  }

  updateRole(role: Role): Promise<Role> {
    const body = JSON.stringify(role);
    return this.securityService.put(this.roleURL, body)
      .then(response => response.json() as Role)
      .catch(this.handleError);
  }

  deleteRole(id: number): Promise<Boolean> {
    return this.securityService.delete(this.roleURL + '/' + id)
      .then(() => true)
      .catch(this.handleError);
  }

  report(report: {}): Promise<string> {
    const body = JSON.stringify(report);
    return this.securityService.post(this.roleURL + '/report', body)
      .then(response => response.text() as string)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
