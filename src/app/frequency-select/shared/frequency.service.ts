import { Injectable } from '@angular/core';
import {SecurityService} from 'security-angular/src/app/security';
import { Frecuencia } from '../../shared/account/frequency';
import { environment } from '../../../environments/environment';

@Injectable()
export class FrequencyService {
  frequencyUrl = environment.apiUrl + '/api/frecuencias';

  constructor(private securityService: SecurityService) {}

  getFrequencies(pager?: any): Promise<any> {
    return this.securityService.get(this.frequencyUrl)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
