import {Injectable} from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class ValidationsService {

  private validationsURL = environment.apiUrl + '/api/';


  constructor(private securityService: SecurityService) {
  }

  getValidations(pager?: any, id?: string): Promise<any> {
    return this.securityService.get(this.validationsURL + 'validarIdentificacion/' + id)
      .then(response => response.json())
      .catch(this.handleError);
  }
  
  getValidation(pager?: any, id?: string): Promise<any> {
    return this.securityService.get(this.validationsURL + 'validarIdentificacion/' + id)
      .then(response => response.json())
      .catch(this.handleError);
  }


  getValidationPost(terms?: any, identification?: any, tipoIdentificacion?: any): Promise<any> {
    const body = JSON.stringify(terms);
    return this.securityService.post(this.validationsURL + 'clientes/validarIdentificacion?identificacion='+identification+"&tipoIdentificacion="+tipoIdentificacion, body)
      .then(response => response.json())
      .catch(this.handleError);
  }

  validationForm(client?: any, section?: any): Promise<any> {
    const body = JSON.stringify(client);
    console.log(body);
    return this.securityService.post(this.validationsURL + 'clientes/validarFormulario?seccion=' + section, body)
      .then(
        response => response.json()
      )
      .catch(
        this.handleError
      );
  }
  
  validationFormAccount(account?: any, business?: string, section?: any): Promise<any> {
    const body = JSON.stringify(account);
    return this.securityService.post(this.validationsURL+'cuentas/validarFormulario?empresa='+business+'&seccion='+section, body)
  }
  
  validationView(section: string, dto: any): Promise<any> {
    const body = JSON.stringify(dto);
    return this.securityService.post(this.validationsURL+section, body)
    .then(response => response.json())
    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
