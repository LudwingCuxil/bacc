import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import { SecurityService } from 'security-angular/src/app/security';
import { environment } from '../../../environments/environment';

@Injectable()
export class BondingService {

  private accountOfficerURL: string = environment.apiUrl + '/api/';  // URL to web api

  constructor(private securityService: SecurityService,private http:Http) { }

  getBondingService(pager?:any,empresa?:string,excludeClientes?:string): Promise<any> {
   return this.securityService.get(this.accountOfficerURL+"vinculaciones")
      .then(response => response.json())
      .catch(this.handleError);
  }


  createBondingService(language: BondingService): Promise<BondingService> {
    let body = JSON.stringify(language);
    return this.http.post(this.accountOfficerURL, body).toPromise()
      .then(response => response.json() as BondingService)
      .catch(this.handleError);

  }

  updateBondingService(language: BondingService): Promise<BondingService> {
    let body = JSON.stringify(language);
    return this.http.put(this.accountOfficerURL, body).toPromise()
      .then(response => response.json() as BondingService)
      .catch(this.handleError);

  }

  deleteBondingService(id: number) : Promise<Boolean> {
    return this.http.delete(this.accountOfficerURL+'/'+id).toPromise()
      .then(() => true)
      .catch(this.handleError);

  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
