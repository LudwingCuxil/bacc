import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class CatalogService {

  private catalogURL: string = environment.apiUrl + '/api/';

  constructor(private securityService: SecurityService) {
  }

  getCatalog(param: string): Promise<any> {
    return this.securityService.get(this.catalogURL + param)
      .then((response) => response.json())
      .catch(this.handleError);
  }
  
  getReportPost(dto?: any, empresa?: any): Promise<any> {
    const body = JSON.stringify(dto);
    return this.securityService.post(this.catalogURL + 'cuentas/reporte?empresa='+empresa, body)
      .then(response => response)
      .catch(this.handleError);
  }
  
  getReportRePost(dto?: any, empresa?: any,supervisor?: any): Promise<any> {
    const body = JSON.stringify(dto);
    return this.securityService.post(this.catalogURL + 'cuentas/reimpresion?empresa='+empresa+"&supervisor="+supervisor, body)
      .then(response => response)
      .catch(this.handleError);
  }
  
  getReportAuthorizationPost( empresa?: any): Promise<any> {
    return this.securityService.post(this.catalogURL + 'cuentas/permiso/reimpresion', empresa)
      .then(response => response)
      .catch(this.handleError);
  }
  
  getCatalogParam(map: string, param: string, value: string): Promise<any> {
      return this.securityService.get(this.catalogURL+map+'?'+param+'='+value)
      .then((response) => response.json())
      .catch(this.handleError);
  }
  
  validSectionAccount(identification: string) : Promise<any> {
    return this.securityService.get(this.catalogURL + 'cuentas/' + identification + '/resumenSeccionesPendientes')
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
