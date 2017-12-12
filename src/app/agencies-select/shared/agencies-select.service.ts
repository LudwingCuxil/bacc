import { Injectable } from "@angular/core";
import { SecurityService } from 'security-angular/src/app/security';
import { environment } from "../../../environments/environment";

@Injectable()
export class AgenciesService{
  private agenciesURL = environment.apiUrl + '/api/';

  constructor(private securityService: SecurityService){}

  getAgenciesServiceByCompany(empresa: string, pager?: any): Promise<any>{
    return this.securityService.get(this.agenciesURL+'agencias?empresa='+empresa)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any>{
    return Promise.reject(error.message || error);
  }
}
