import { Injectable } from '@angular/core';
import "rxjs/add/operator/toPromise";

import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
import {ClienteDto} from "../../shared/client/cliente-dto";

@Injectable()
export class UpdateIdService {
  private URL : string = environment.apiUrl + '/api/clientes/';

  constructor(private securityService: SecurityService) { }

  getIdName(identification: string) {
    return this.securityService.get(this.URL+identification+"/cambio/datosGenerales")
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  applyAutorization() : Promise<any>{
    return this.securityService.post(this.URL+'permiso/cambioId')
      .then(response => response.json() as any)
      .catch(this.handleError);
  }

  updateId(identification: string, client: ClienteDto) {
    let body = JSON.stringify(client);
    return this.securityService.put(this.URL+identification+'/iden', body )
      .then(response => response.json() as ClienteDto)
      .catch(this.handleError);

  }
  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
