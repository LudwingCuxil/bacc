import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import { SecurityService } from 'security-angular/src/app/security';
import { environment } from "../../../environments/environment";


@Injectable()
export class EconomicSectorService {

  private economicSectorURL = environment.apiUrl + '/api/';  // URL to web api

  constructor(private securityService: SecurityService,private http:Http) { }


  
   geteconomicSectorService(pager?:any): Promise<any> {
       return this.securityService.get(this.economicSectorURL+"sectoresEconomicos")
      .then(response => response.json())
      .catch(this.handleError);
  }
  
//   geteconomicSectorService(pager?:any): Promise<any> {
//       return this.securityService.post(this.economicSectorURL+"sectoresEconomicos")
//      .then(response => response.json())
//      .catch(this.handleError);
//  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
