import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import { SecurityService } from 'security-angular/src/app/security';
import { environment } from "../../../environments/environment";

@Injectable()
export class SalesLevelService {

  private salesLevelURL = environment.apiUrl + '/api/';  // URL to web api

  constructor(private securityService: SecurityService,private http:Http) { }

  getSalesLevelService(pager?:any): Promise<any> {
       return this.securityService.get(this.salesLevelURL+'nivelesVentas')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
