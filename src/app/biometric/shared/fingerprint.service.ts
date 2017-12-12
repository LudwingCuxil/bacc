import { Injectable } from '@angular/core';
import { SecurityService } from 'security-angular/src/app/security';

@Injectable()
export class FingerprintService {
        
  private fingerprintURL = "/api/fingerprint/";
  
  constructor(private securityService : SecurityService) {}
    
  getFingerprintService(pager?:any): Promise<any> {
    return this.securityService.get(this.fingerprintURL+this.securityService.getPagerURL(pager))
      .then(response => response.json())
      .catch(this.handleError);
  }
  
  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}