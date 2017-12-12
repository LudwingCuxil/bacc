import {Injectable} from '@angular/core';
import 'rxjs/add/operator/toPromise';

import {Http} from '@angular/http';
import {Location} from '@angular/common';
import {SecurityService} from 'security-angular/src/app/security';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {User} from './user';

@Injectable()
export class UserService {

  private userURL: string = environment.apiUrl + '/api/usuario';

  constructor(private securityService: SecurityService) {
  }

  getUsers(pager?: any): Promise<any> {
    return this.securityService.get(this.userURL + this.securityService.getPagerURL(pager))
      .then(response => response.json())
      .catch(this.handleError);
  }

  getDetailUser(id: number): Promise<User> {
    return this.securityService.get(this.userURL + '/' + id)
      .then(response => response.json() as User)
      .catch(this.handleError);
  }

  searchUsers(user: any, pager?: any): Promise<any> {
    const body = JSON.stringify(user);
    return this.securityService.post(this.userURL + '/findAll' + this.securityService.getPagerURL(pager), body)
      .then(response => response.json())
      .catch(this.handleError);

  }

  createUser(user: User): Promise<User> {
    const body = JSON.stringify(user);
    return this.securityService.post(this.userURL, body)
      .then(response => response.json() as User)
      .catch(this.handleError);
  }

  updateUser(user: User): Promise<User> {
    const body = JSON.stringify(user);
    return this.securityService.put(this.userURL, body)
      .then(response => response.json() as User)
      .catch(this.handleError);
  }

  deleteUser(id: number): Promise<Boolean> {
    return this.securityService.delete(this.userURL + '/' + id)
      .then(() => true)
      .catch(this.handleError);
  }

  report(report: {}): Promise<string> {
    const body = JSON.stringify(report);
    return this.securityService.post(this.userURL + '/report', body)
      .then(response => response.text() as string)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  getDetailUserByUsername(): Promise<User> {
    return this.securityService.get(this.userURL + '/informacion')
      .then(response => response.json() as User)
      .catch(this.handleError);
  }

}
