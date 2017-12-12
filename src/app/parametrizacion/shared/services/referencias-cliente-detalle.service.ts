import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import {environment} from '../../../../environments/environment';
import {SecurityService} from 'security-angular/src/app/security';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ReferenciasClienteDetalleService {
  private apiUrl = environment.apiUrl + '/api'; // URL to werb Api

  constructor(
    private securityService: SecurityService
  ) {}

   getRefenciasClienteDetalle(idReferenciaCliente?: number, pager?: any): Promise<any> {
      return this.securityService.get(`${this.apiUrl}/referenciasCliente/${idReferenciaCliente}/detalles`)
        .then(response => response.json())
        .catch(this.handleError);
   }

   addReferenciasClienteDetalle(referenciasClienteDetalle: any): Promise<any> {
     const referenciasClienteDetalleAdd = JSON.parse(JSON.stringify(referenciasClienteDetalle));

     return this.securityService.post(`${this.apiUrl}/referenciasClienteDetalle`, referenciasClienteDetalleAdd)
       .then(response => response.json())
       .catch(this.handleError);
   }

   deleteRefenciasClienteDetalle(id: number): Promise<any> {
      return this.securityService.delete(`${this.apiUrl}/referenciasClienteDetalle/${id}`)
        .then(() => true)
        .catch(this.handleError);
   }

   updateRefenciasClientesDetalle(referenciasClienteDetalle: any): Promise<any> {
     const referenciasClienteDetalleUpdate = JSON.stringify(referenciasClienteDetalle);

     return this.securityService.put(`${this.apiUrl}/referenciasClienteDetalle`, referenciasClienteDetalleUpdate)
      .then(response => response.json())
      .catch(this.handleError);
   }

   private handleError(error: any): Promise<any> {
    console.error('Ha ocurrido un error', error); // for demo purposes only

    return Promise.reject(error.message || error);
  }
}
