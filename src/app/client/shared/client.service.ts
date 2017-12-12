import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';

import {SecurityService} from 'security-angular/src/app/security';

import {Client} from 'backoffice-ace/src/app/core/client-core/shared/client';
import {ClientCore} from 'backoffice-ace/src/app/core/client-core/shared/client-core';
import {Client as InnerClient} from './client.model';
import {environment} from '../../../environments/environment';

@Injectable()
export class ClientService {

  private clientURL = environment.apiUrl + '/api/';  // URL to web api

  constructor(private securityService: SecurityService, private http: Http) {
  }

  getClients(pager?: any): Promise<any> {
    return this.securityService.get(this.clientURL + 'clientes')
      .then(response => response.json())
      .catch(this.handleError);
  }

  setEndpoint(url: string) {
    this.clientURL = url;
  }

  getDetailClient(id: number): Promise<Client> {
    return this.securityService.get(this.clientURL + 'clientes/' + id)
      .then(response => response.json())
      .catch(this.handleError);
  }

  dequeueFaceFinger(tipoIdentificacion: any, identificacion: any, tipo: any, nombre: any ): Promise<Client> {
    const body = JSON.stringify('');
    return this.securityService.post(this.clientURL + 'clientes/cambioHuellaFoto?tipoIdentificacion=' + tipoIdentificacion + '&identificacion='
       + identificacion + '&tipo=' + tipo + '&nombre=' + nombre , body).
      then(response => response.json())
      .catch(this.handleError);
  }

  getDetailInnerClient(id: any): Promise<InnerClient> {
    return this.securityService.get(this.clientURL + 'clientes/' + id)
      .then(response => response.json())
      .catch(this.handleError);
  }

  getDetailClientCore(id: string): Promise<ClientCore> {
    return this.securityService.get(this.clientURL + 'clientes' + '/' + id)
      .then(response => response.json() as ClientCore)
      .catch(this.handleError);
  }

  searchClients(terms: any, pager?: any): Promise<any> {
    console.log('Terms: ' + terms);
    const body = JSON.stringify(terms);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(this.clientURL + 'clientes' + this.securityService.getPagerURL(pager), body, options).toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  createClient(language: Client): Promise<Client> {
    const body = JSON.stringify(language);
    return this.http.post(this.clientURL, body).toPromise()
      .then(response => response.json() as Client)
      .catch(this.handleError);

  }

  updateClient(language: Client): Promise<Client> {
    const body = JSON.stringify(language);
    return this.http.put(this.clientURL, body).toPromise()
      .then(response => response.json() as Client)
      .catch(this.handleError);

  }

  deleteClient(id: number): Promise<Boolean> {
    return this.http.delete(this.clientURL + '/' + id).toPromise()
      .then(() => true)
      .catch(this.handleError);

  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
