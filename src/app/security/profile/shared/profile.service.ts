import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Profile} from './profile';
import 'rxjs/add/operator/toPromise';

import {SecurityService} from 'security-angular/src/app/security';
import {SearchEntity} from 'security-angular/src/app/search/search.model';
import {environment} from '../../../../environments/environment';
import {Role} from '../../role/shared/role';

@Injectable()
export class ProfileService {
  private profileURL: string = environment.apiUrl + '/api/profiles';

  constructor(private http: Http, private securityService: SecurityService) {
  }

  getProfiles(pager?: any): Promise<any> {
    return this.securityService.get(this.profileURL + this.securityService.getPagerURL(pager))
      .then(response => response.json())
      .catch(this.handleError);

  }

  getDetailProfile(id: number): Promise<Profile> {
    return this.securityService.get(this.profileURL + '/' + id)
      .then(response => response.json() as Profile)
      .catch(this.handleError);

  }

  searchProfiles(profile: SearchEntity, pager?: any): Promise<any> {
    const body = JSON.stringify(profile);
    return this.securityService.post(this.profileURL + '/findAll' + this.securityService.getPagerURL(pager), body)
      .then(response => response.json())
      .catch(this.handleError);
  }

  getRolesByProfile(id: number): Promise<any> {
    return this.securityService.get(this.profileURL + '/findRolByPerfilId/' + id)
      .then(response => response.json())
      .catch(this.handleError);
  }

//  getRoles(roles: Array<number>): Promise<Role[]> {
//    let body = JSON.stringify(roles);
//    return this.securityService.post(this.roleURL + '/findAllByIds', body)
//             .then(response => response.json() as Role[])
//             .catch(this.handleError);
//  }

  addRoles(id: number, roles: Array<number>): Promise<Array<number>> {
    const body = JSON.stringify(roles);
    return this.securityService.put(this.profileURL + '/' + id + '/roles', body)
      .then(response => response.json() as Array<number>)
      .catch(this.handleError);

  }

  deleteRoles(id: number, roles: Array<number>): Promise<Array<number>> {
    const body = JSON.stringify(roles);
    return this.securityService.post(this.profileURL + '/' + id + '/deleteRoles', body)
      .then(response => response.json() as Array<number>)
      .catch(this.handleError);

  }

  createProfile(profile: Profile): Promise<Profile> {
    const body = JSON.stringify(profile);
    console.log(body);
    return this.securityService.post(this.profileURL, body)
      .then(response => response.json() as Profile)
      .catch(this.handleError);
  }

  updateProfile(profile: Profile): Promise<Profile> {
    const body = JSON.stringify(profile);
    return this.securityService.put(this.profileURL, body)
      .then(response => response.json() as Profile)
      .catch(this.handleError);
  }

  deleteProfile(id: number): Promise<Boolean> {
    return this.securityService.delete(this.profileURL + '/' + id)
      .then(() => true)
      .catch(this.handleError);
  }

  getParent(): SecurityService {
    return this.securityService;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
