import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
import {PlatformParameters} from '../../shared/platform-parameters.enum';
import {PlParameter} from './pl-parameter';

@Injectable()
export class PlParameterService {

  private platformUrl = environment.apiUrl + '/api/parametrosPlataforma';  // URL to web api


  constructor(private securityService: SecurityService) {
  }

  getplParameter(pager?: any, id?: string): Promise<any> {
    return this.securityService.get(`${this.platformUrl}/${id}`)
      .then(response => response.json())
      .catch(this.handleError);
  }

  getParametersLists(codeEntity: string, list: string, pager?: any): Promise<any> {
    return this.securityService.get(`${this.platformUrl}/listas?codigoEntidad=${codeEntity}&lista=${list}`, pager)
      .then(response => response.json())
      .catch(this.handleError);
  }

  getParameter(code: PlatformParameters, pager?: any): Promise<any> {
    return this.securityService.get(`${this.platformUrl}/${code}`, pager)
      .then(response => response.json() as PlParameter)
      .catch(this.handleError);
  }

  getParameterValues(code: PlatformParameters, pager?: any): Promise<any> {
    return this.securityService.get(`${this.platformUrl}/${code}/valores`, pager)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
