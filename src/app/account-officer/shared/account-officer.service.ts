import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import { SecurityService } from 'security-angular/src/app/security';
import { environment } from '../../../environments/environment';

@Injectable()
export class AccountOfficerService {

  private accountOfficerURL: string = environment.apiUrl + '/api/ejecutivosNegocio';  // URL to web api

  constructor(private securityService: SecurityService,private http:Http) { }

  getAccountOfficerService(pager?:any,empresa?:string,excludeClientes?:string): Promise<any> {
   return this.securityService.get(this.accountOfficerURL+"?empresa="+empresa)
      .then(response => response.json())
      .catch(this.handleError);
  }

  /*getDetailAccountOfficerService(id: number) : Promise<AccountOfficerService> {
    return this.http.get(this.accountOfficerURL+'/'+id)
      .then(response => response.json() as AccountOfficerService)
      .catch(this.handleError);
  }*/

  /*getDetailAccountOfficerService(id: string) : Promise<AccountOfficerService> {
    return this.http.get(this.accountOfficerURL+'/'+id).toPromise()
      .then(response => response.json() as AccountOfficerService)
      .catch(this.handleError);
  }*/

  /*searchAccountOfficerService(terms: any, pager?:any) : Promise<any> {
    let body = JSON.stringify(terms);
    return this.http.post((this.accountOfficerURL+this.securityService.getPagerURL(pager), body).toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }*/

  createAccountOfficerService(language: AccountOfficerService): Promise<AccountOfficerService> {
    let body = JSON.stringify(language);
    return this.http.post(this.accountOfficerURL, body).toPromise()
      .then(response => response.json() as AccountOfficerService)
      .catch(this.handleError);

  }

  updateAccountOfficerService(language: AccountOfficerService): Promise<AccountOfficerService> {
    let body = JSON.stringify(language);
    return this.http.put(this.accountOfficerURL, body).toPromise()
      .then(response => response.json() as AccountOfficerService)
      .catch(this.handleError);

  }

  deleteAccountOfficerService(id: number) : Promise<Boolean> {
    return this.http.delete(this.accountOfficerURL+'/'+id).toPromise()
      .then(() => true)
      .catch(this.handleError);

  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
