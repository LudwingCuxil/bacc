import * as basicMaintenance from './basic-maintenance';

export const environment = {
  production: true,
  apiUrl: 'http://172.16.10.160:7080/services',
  key: '-----BEGIN PUBLIC KEY-----' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCocAyDfnyOdusHeNxBCz3MmTGm' +
  'e4n1Z7q/PsDwOEo83yY1zDL+86zHsCflpWvYSp+H3bkOOre74kvjtToZMMw3cxev' +
  'jCugZhVvaTl+/9VV+lLE1M8X9c77dAOSRxst9om8Jcx1EEQ5K+ibZ2QTxPykteSI' +
  '36d++9y9GQxQCs4gkwIDAQAB' +
  '-----END PUBLIC KEY-----',
  basicMaintenance,
};
