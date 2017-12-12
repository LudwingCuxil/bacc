import {Injectable} from '@angular/core';

import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';

@Injectable()
export class NeighborhoodService {

  private neighborhoodURL = environment.apiUrl;  // URL to web api

  constructor(private securityService: SecurityService) {
  }

  getNeighborhoods(): Promise<any> {
    return this.securityService.get(this.neighborhoodURL + '/api/barrios')
      .then(response => response.json())
      .catch(this.handleError);
  }

  getNeighborhoodById(neighborhood: number): Promise<any> {
    return this.securityService.get(this.neighborhoodURL + '/api/barrios?codigo=' + neighborhood)
      .then(response => response.json())
      .catch(this.handleError);
  }

  searchNeighborhoods(search: string): Promise<any> {
    return this.securityService.get(this.neighborhoodURL + '/api/direcciones?nombreBarrio=' + search)
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}

