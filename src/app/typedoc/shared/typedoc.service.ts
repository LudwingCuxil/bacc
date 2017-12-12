import {Injectable, Optional} from "@angular/core";

import {Router} from "@angular/router";
import {Location} from "@angular/common";


import {SecurityService} from "security-angular/src/app/security";
import { Http } from "@angular/http";
import { TypedocService as ParentTypedocService } from 'backoffice-ace/src/app/core/typedoc/shared/typedoc.service'

@Injectable()
export class TypedocService {
    
   document2URL = 'http://localhost:8080/services/api/';  // URL to web api
   
   constructor(private httpd: Http,securityServices: SecurityService) { 
   // super (securityServices);
   // super.setEndpoint(this.document2URL);
   }
   
  getDocuments(pager?:any,tipo?:string): Promise<any> {
    /*return this.securityService.getRequestOptions().then(request => {
     return this.http.get(this.languageURL, request)
     .toPromise()
     .then(response => response.json().content as Document[])
     .catch(this.handleError);
     });*/
    return this.httpd.get(this.document2URL+"tipoDocumentos/"+tipo).toPromise()
      .then(response => response.json())
      .catch(this.handleError2);
  }

  //this.setEndpoint("dfasfdasfdas");
  
  private handleError2(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}


