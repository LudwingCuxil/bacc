import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';

import {SecurityService} from 'security-angular/src/app/security';

import {LoginComponent} from '../login/login.component';
import {PersonTypeComponent} from '../person-type/person-type.component';
import {EconomicProfileComponent} from '../economic-profile/economic-profile.component';
import {LegalGeneralDataComponent} from '../legal-general-data/legal-general-data.component';
import {BusinessDataLegalComponent} from '../business-data-legal/business-data-legal.component';
import {SupplierReferenceComponent} from '../supplier-reference/supplier-reference.component';
import {LegalRepresentativeComponent} from '../legal-representative/legal-representative.component';
import {AdditionalDataComponent} from '../additional-data/additional-data.component';
import {PresentedDocumentsComponent} from '../presented-documents/presented-documents.component';
import {AddressInformationComponent} from '../address-information/address-information.component';
import {CustomerCreatedComponent} from '../customer-created/customer-created.component';
import {NaturalGeneralDataComponent} from '../natural-general-data/natural-general-data.component';
import {DependentReferenceComponent} from '../dependent-reference/dependent-reference.component';
import {LaboralReferenceComponent} from '../laboral-reference/laboral-reference.component';
import {DataCustomerComponent} from '../data-customer/data-customer.component';
import {CreateAccountComponent} from '../create-account/create-account.component';
import {GeneralInformationComponent} from '../general-information/general-information.component';
import {FingerprintComponent} from '../biometric/fingerprint.component';
import {PortalAdminClientComponent} from '../portal/portal-admin-client.component';
import {PortalAdminAccountComponent} from '../portal/portal-admin-account.component';
import {PortalCreateClientComponent} from '../portal/portal-create-client.component';
import {NeighborhoodSearchComponent} from '../neighborhood/search/neighborhood-search.component';
import {PortalCreateAccountComponent} from '../portal/portal-create-account.component';
import {ReferencesComponent} from '../references/references.component';
import { AdministrationCheckbooksComponent } from '../administration-checkbooks/administration-checkbooks.component';
import { BeneficiarioFinal } from '../shared/account/final-beneficiary';
//import {RolesComponent} from 'security-angular/src/app/role/role.component';
import {RoleComponent} from '../security/role/role.component';
import {ProfileComponent} from '../security/profile/profile.component';
//import {UsersComponent} from 'security-angular/src/app/user/user.component';
import {UserComponent} from '../security/user/user.component';
import {ReferenciasClienteComponent} from '../parametrizacion/referencias-cliente/referencias-cliente.component';

const appRoutes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},

  {path: 'home', loadChildren: 'security-angular/src/app/home/home.module#HomeModule'},
  {path: 'login', component: LoginComponent},

  { path: 'roles', component: RoleComponent, canActivate: [SecurityService]},
  { path: 'profiles', component: ProfileComponent, canActivate: [SecurityService]},
  { path: 'users', component: UserComponent, canActivate: [SecurityService]},
  {path: 'create', component: CreateAccountComponent, canActivate: [SecurityService]},
  {path: 'person', component: PersonTypeComponent},
  {path: 'legal-general', component: LegalGeneralDataComponent},
  {path: 'economic-profile', component: EconomicProfileComponent},
  {path: 'business-data-legal', component: BusinessDataLegalComponent},
  {path: 'supplier-reference', component: SupplierReferenceComponent},
  {path: 'legal-representative', component: LegalRepresentativeComponent},
  {path: 'additional-data', component: AdditionalDataComponent},
  {path: 'general-information', component: GeneralInformationComponent},
  {path: 'presented-documents', component: PresentedDocumentsComponent},
  {path: 'address-information', component: AddressInformationComponent},
  {path: 'customer-created', component: CustomerCreatedComponent},
  {path: 'natural-general', component: NaturalGeneralDataComponent},
  {path: 'dependet-reference', component: DependentReferenceComponent},
  {path: 'laboral-reference', component: LaboralReferenceComponent},
  {path: 'fingerprint', component: FingerprintComponent},
  {path: 'portalClients/:id', component: PortalAdminClientComponent, canActivate: [SecurityService]},
  {path: 'portalClients', component: PortalAdminClientComponent, canActivate: [SecurityService]},
  {path: 'portalAccounts', component: PortalAdminAccountComponent, canActivate: [SecurityService]},
  {path: 'portalCreateClient/:param', component: PortalCreateClientComponent, canActivate: [SecurityService]},
  {path: 'portalCreateClient', component: PortalCreateClientComponent, canActivate: [SecurityService]},
  {path: 'portalCreateAccount', component: PortalCreateAccountComponent, canActivate: [SecurityService]},
  {path: 'neighborhood-search', component: NeighborhoodSearchComponent},
  {path: 'references', component: ReferencesComponent},
  {path: 'costumer', component: DataCustomerComponent},
  {path: 'beneficiariesFinal', component: BeneficiarioFinal},
  {path: 'administration-checkbooks', component: AdministrationCheckbooksComponent},
  { path: 'referenciasCliente', component: ReferenciasClienteComponent},
];
@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}]
})
export class AppRoutingModule {
}
