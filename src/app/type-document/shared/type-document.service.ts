import {Injectable, Optional} from "@angular/core";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import { environment } from '../../../environments/environment';
import { SecurityService } from 'security-angular/src/app/security';
import { Http } from "@angular/http";

@Injectable()
export class TypeDocumentService {
    
   document2URL = environment.apiUrl+"/api/";  // URL to web api
   
   constructor(private httpd: Http,private securityService: SecurityService) { 
   // super (securityServices);
   // super.setEndpoint(this.document2URL);
   }
   
  async getDocumentItentification(tipo?:string): Promise<any> {
    const response = await this.securityService.get(this.document2URL+"/tipoDocumentos/?tipoPersona="+tipo);
    return response.json() as any;
  }

  //this.setEndpoint("dfasfdasfdas");
  
  private handleError2(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}


