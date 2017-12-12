import {Injectable} from '@angular/core';
import {Http, RequestOptions, ResponseContentType} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {environment} from '../../../../environments/environment';

import {SecurityService} from 'security-angular/src/app/security';

@Injectable()
export class AvatarInformationService {

  private informationURL: string = environment.apiUrl + '/api/clientes/';

  constructor(private http: Http, private _sercuirtyService: SecurityService) {
  }

  getAvatar(identificacion: string): Promise<any> {
    const headers = [{'Accept': 'image/png'}, {'Accept': 'image/jpg'}];
    return this._sercuirtyService.getAuthHeaders().then(authHeaders => {
      if (headers !== undefined) {
        for (const header of headers) {
          authHeaders.append(Object.keys(header)[0], (<any>Object).values(header)[0]);
        }
      }
      const options = new RequestOptions({headers: authHeaders, responseType: ResponseContentType.Blob});
      return this.http.get(this.informationURL + identificacion + '/avatar', options).toPromise().catch(e => this.handleError(e));
    }).then(response => response.blob())
      .catch(this.handleError);
  }

  getEndPoint(): string {
    return this.informationURL;
  }

  setEndPoint(url: string): void {
    this.informationURL = url;
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
