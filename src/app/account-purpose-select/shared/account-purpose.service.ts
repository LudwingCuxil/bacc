import { Injectable } from "@angular/core";
import { SecurityService } from 'security-angular/src/app/security'
import { environment } from "../../../environments/environment";

@Injectable()
export class AccountPurposeService{
  private accountPurposeURL = environment.apiUrl + '/api/';

  constructor(private securityService: SecurityService){}

  getAccountPurposesService(pager?: any): Promise<any>{
    return this.securityService.get(this.accountPurposeURL + 'usosCuenta')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any>{
    return Promise.reject(error.message || error);
  }
}
