import { Injectable } from '@angular/core';
import "rxjs/add/operator/toPromise";
import {Client} from '../../client/shared/client.model';

import {SecurityService} from 'security-angular/src/app/security';
//import {ClientInformation} from '../../shared/client-information.model';
import {environment} from '../../../environments/environment';

@Injectable()
export class UpdateNameService {

  private updateNameURL : string = environment.apiUrl + '/api/clientes/';

  constructor(private securityService : SecurityService){}

  getUpdateName(identificacion: string) : Promise<Client>{
    return this.securityService.get(this.updateNameURL+identificacion+'/cambio/nombre')
      .then((response) => response.json() as Client)
      .catch(this.handleError);
  }

  applyAutorization() : Promise<any>{
    return this.securityService.post(this.updateNameURL+'permiso/cambioNombre')
      .then(response => response.json() as any)
      .catch(this.handleError);
  }

  updateName(identification : string, client : Client) : Promise<Client> {
    let body = JSON.stringify(client);
    return this.securityService.put(this.updateNameURL+identification+'/nombre', body )
      .then(response => response.json() as Client)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
