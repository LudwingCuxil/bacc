import { Injectable } from "@angular/core";
import { SecurityService } from 'security-angular/src/app/security';
import { environment } from "../../../environments/environment";

@Injectable()
export class NoCustomerEmployeesService{

  private operationsSupervisorURL = environment.apiUrl + '/api/';

  constructor(private securityService: SecurityService){}

  getNoCustomerEmployees(empresa: string,endpoint:string): Promise<any>{
    if(!endpoint){
    endpoint = 'empleadosNoClientes';    
    }
    return this.securityService.get(this.operationsSupervisorURL+endpoint+'?empresa='+empresa)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any>{
    return Promise.reject(error.message || error);
  }

}



