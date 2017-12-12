import * as basicMaintenance from './basic-maintenance';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = Object.freeze({
  production: false,
  apiUrl: 'http://localhost:8080/services',
  key: '-----BEGIN PUBLIC KEY-----' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCocAyDfnyOdusHeNxBCz3MmTGm' +
    'e4n1Z7q/PsDwOEo83yY1zDL+86zHsCflpWvYSp+H3bkOOre74kvjtToZMMw3cxev' +
    'jCugZhVvaTl+/9VV+lLE1M8X9c77dAOSRxst9om8Jcx1EEQ5K+ibZ2QTxPykteSI' +
    '36d++9y9GQxQCs4gkwIDAQAB' +
    '-----END PUBLIC KEY-----',
  basicMaintenance,
});
