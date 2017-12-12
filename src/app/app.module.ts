import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Http} from '@angular/http';

import { BasicMaintenanceModule } from '@byte/ng-forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {TranslateLoader, TranslateModule} from 'ng2-translate';
import {PopoverModule} from 'ng2-popover';
import {DatePickerModule} from 'ng2-datepicker';
import {DataTableByteModule} from './components/data-table';
import {
  httpFactory,
  MenuModule,
  ReportModule,
  SearchModule,
  SecurityModule,
  SharedModule,
  UserModule,
  SecurityService,
} from 'security-angular/src/app/';
import {FooterComponent} from 'security-angular/src/app/footer/footer.component';

import {BackOfficeAceModule} from 'backoffice-ace/src/app/app.module';
import {CoreModule} from 'backoffice-ace/src/app/core/core.module';

import {AppRoutingModule} from './routing/routing.module';
import {environment} from '../environments/environment';

import {AppComponent} from './app.component';
import {TypedocSelectComponent} from './typedoc/typedoc-select.component';
import {BondingSelectComponent} from './bonding/bonding-select.component';
import {PersonTypeComponent} from './person-type/person-type.component';
import {LegalGeneralDataComponent} from './legal-general-data/legal-general-data.component';
import {AccountOfficerComponent} from './account-officer/account-officer.component';
import {SalesLevelSelectComponent} from './sales-level/sales-level.select.component';
import {TypeSocietySelectComponent} from './type-society/type-society.select.component';
import {EconomicProfileComponent} from './economic-profile/economic-profile.component';
import {EconomicSectorSelectComponent} from './economic-sector/economic-sector.select.component';
import {ClassCustomerSelectComponent} from './class-customer/class-customer.select.component';
import {TypeCustomerSelectComponent} from './type-customer/type-customer.select.component';
import {BusinessExecutiveSelectComponent} from './business-executive/business-executive.select.component';
import {InstitutionSelectComponent} from './institution/institution.select.component';
import {EconomicActivitiesSelectComponent} from './economic-activities/economic-activities.select.component';
import {TypeInstitutionSelectComponent} from './type-institution/type-institution.select.component';
import {BusinessDataLegalComponent} from './business-data-legal/business-data-legal.component';
import {SupplierReferenceComponent} from './supplier-reference/supplier-reference.component';
import {LegalRepresentativeComponent} from './legal-representative/legal-representative.component';
import {ProfessionSelectComponent} from './profession/profession.select.component';
import {AdditionalDataComponent} from './additional-data/additional-data.component';
import {PresentedDocumentsComponent} from './presented-documents/presented-documents.component';
import {AddressInformationComponent} from './address-information/address-information.component';
import {CustomerCreatedComponent} from './customer-created/customer-created.component';
import {NaturalGeneralDataComponent} from './natural-general-data/natural-general-data.component';
import {CivilStatusSelectComponent} from './civil-status/civil-status.select.component';
import {DependentReferenceComponent} from './dependent-reference/dependent-reference.component';
import {LaboralReferenceComponent} from './laboral-reference/laboral-reference.component';
import {CountrySelectComponent} from './country/country-select.component';
import {CreateAccountComponent} from './create-account/create-account.component';
import {GeneralInformationComponent} from './general-information/general-information.component';
import {RegionSelectComponent} from './region/region-select.component';
import {DepartmentSelectComponent} from './department/department-select.component';
import {MunicipalitySelectComponent} from './municipality/municipality-select.component';
import {NeighborhoodSelectComponent} from './neighborhood/neighborhood-select.component';
import {AddressRouteSelectComponent} from './address-route/address-route-select.component';
import {AddressZoneSelectComponent} from './address-zone/address-zone-select.component';
import {FingerprintComponent} from './biometric/fingerprint.component';
import {ClientSearchComponent} from './client/client.search.component';
import {TextMaskModule} from 'angular2-text-mask';
import {PortalHeaderComponent} from './portal/portal-header/portal-header.component';
import {AccountComponent} from './portal/account/account.component';
import {PortalAdminClientComponent} from './portal/portal-admin-client.component';
import {PortalContentComponent} from './portal/portal-content/portal-content.component';
import {ContentFooterComponent} from './portal/portal-content/content-footer/content-footer.component';
import {LoginComponent} from './login/login.component';
import {ProductSelectionComponent} from './product-selection/product-selection.component';
import {CurrencySelectComponent} from './currency-select/currency-select.component';
import {ProductTypeSelectComponent} from './type-product-select/type-product-select.component';
import {ProductSelectComponent} from './product-select/product-select.component';
import {DataCustomerComponent} from './data-customer/data-customer.component';
import {OriginFundsSelectComponent} from './origin-funds-select/origin-funds-select.component';
import {AccountPurposeSelectComponent} from './account-purpose-select/account-purpose-select.component';
import {PromotionsSelectComponent} from './promotions-select/promotions-select.component';
import {AgenciesSelectComponent} from './agencies-select/agencies-select.component';
import {OperationsSupervisorComponent} from './operations-supervisor/operations-supervisor.component';
import {AdministrationInterestsComponent} from './administration-interests/administration-interests.component';
import {UpdateNameComponent} from './update-name/update-name.component';
import {AuthorizationComponent} from './authorization/authorization.component';
import {AdministrationCheckbooksComponent} from './administration-checkbooks/administration-checkbooks.component';
import {PortalAdminAccountComponent} from './portal/portal-admin-account.component';
import {MethodPaymentComponent} from './method-payment/method-payment.component';
import {AccountSelectComponent} from './account-select/account-select.component';
import {AddressTypeSelectComponent} from './address-type-select/address-type-select.component';
import {NavigationService} from './shared/services/navigation.service';
import {PortalCreateClientComponent} from './portal/portal-create-client.component';
import {CreateClientContentComponent} from './portal/portal-content/create-client-content.component';
import {CancelConfirmationComponent} from './cancel-confirmation/cancel-confirmation.component';
import {DependentComponent} from './references/dependent/dependent.component';
import {RelationshipSelectComponent} from './components/select/relationship-select.component';
import {CreateClientHeaderComponent} from './portal/portal-header/create-client-header.component';
import {NeighborhoodSearchComponent} from './neighborhood/search/neighborhood-search.component';
import {ModalComponent} from './components/modal/modal.component';
import {PartialPersistService} from './shared/services/partial-persist.service';
import {ErrorsMessageComponent} from './components/errors-message/errors-message.component';
import {ValidationsService} from './shared/services/validations.service';
import {ChangeService} from './shared/services/change.service';
import {PortalCreateAccountComponent} from './portal/portal-create-account.component';
import {CreateAccountContentComponent} from './portal/portal-content/create-account-content.component';
import {CreateAccountHeaderComponent} from './portal/portal-header/create-account-header.component';
import {TypeDocumentSelectComponent} from './type-document/type-document-select.component';
import {SalarySelectComponent} from './laboral-reference/salary-select.component';
import {ReferencesComponent} from './references/references.component';
import {ShareholderReferenceComponent} from './references/shareholders/shareholder.component';
import {NoCustomerEmployeesComponent} from './no-customer-employees/no-customer-employees-select.component';
import {CreditReferenceComponent} from './references/credit/credit.component';
import {ReferenceTypeSelectComponent} from './references/type-select/type-select.component';
import {AccountReferenceComponent} from './references/account/account.component';
import {PersonalReferenceComponent} from './references/personal/personal.component';
import {InsuranceReferenceComponent} from './references/insurance/insurance.component';
import {VehicleReferenceComponent} from './references/vehicle/vehicle.component';
import {AddressComponent} from './data-customer/address/address.component';
import {SignatureComponent} from './signature/signature.component';
import {ElectronicServiceComponent} from './electronic-service/electronic-service.component';
import {AccountCreatedComponent} from './account-created/account-created.component';
import {CheckbookTypeSelectComponent} from './administration-checkbooks/checkbook-type-select.component';
import {FrequencySelectComponent} from './frequency-select/frequency-select.component';
import {JointAccountComponent} from './joint-account/joint-account.component';
import {BeneficiaryComponent} from './beneficiary/beneficiary.component';
import {BeneficiaryFinalComponent} from './beneficiary-final/beneficiary-final.component';
import {FixedTermComponent} from './fixed-term/fixed-term.component';
import {DeadLineSelectedComponent} from './fixed-term/deadline-selected.component';
import {AccountSelectedComponent} from './fixed-term/account-select.component';
import {UpdateAccountNameComponent} from './update-account/update-name/update-name.component';
import { GroupComponent } from './group/group.component';
import { EconomicGroupComponent } from './group/economic/economic-group.component';
import {EconomicGroupSelectComponent} from './economic-group/economic-group.select.component';
import { RoleComponent } from './security/role/role.component';
import { UserComponent } from './security/user/user.component';
import { ProfileComponent } from './security/profile/profile.component';
import { UserDetailComponent } from './security/user/user-detail.component';
import {ProfileSelectComponent } from './security/profile/profile-select.component';
import {RoleDetailComponent} from './security/role/role-detail.component';
import {ProfileDetailComponent} from './security/profile/profile-detail.component';
import {RoleDualListComponent} from './security/role/role-dual-list.component';
import {TransferAccountComponent} from './transfer-account/transfer-account.component';
import {AccountDualListComponent} from './transfer-account/account-dual-list.component';
import { MenuComponent } from './menu/menu.component';
import {DualListAccountComponent} from './transfer-account/dual-list.component';
import { UpdateIdComponent } from './update-id/update-id.component';
import {ReferenciasClienteComponent} from './parametrizacion/referencias-cliente/referencias-cliente.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import {EconomicRelationSelectComponent} from './economic-profile/economic-relation.select.component';
@NgModule({
  declarations: [
    AppComponent,
    PersonTypeComponent,
    TypedocSelectComponent,
    LegalGeneralDataComponent,
    AccountOfficerComponent,
    SalesLevelSelectComponent,
    TypeSocietySelectComponent,
    EconomicProfileComponent,
    EconomicSectorSelectComponent,
    ClassCustomerSelectComponent,
    TypeCustomerSelectComponent,
    BusinessExecutiveSelectComponent,
    InstitutionSelectComponent,
    EconomicActivitiesSelectComponent,
    TypeInstitutionSelectComponent,
    BusinessDataLegalComponent,
    SupplierReferenceComponent,
    LegalRepresentativeComponent,
    ProfessionSelectComponent,
    AdditionalDataComponent,
    PresentedDocumentsComponent,
    AddressInformationComponent,
    CustomerCreatedComponent,
    NaturalGeneralDataComponent,
    CivilStatusSelectComponent,
    DependentReferenceComponent,
    LaboralReferenceComponent,
    CountrySelectComponent,
    CreateAccountComponent,
    GeneralInformationComponent,
    RegionSelectComponent,
    DepartmentSelectComponent,
    MunicipalitySelectComponent,
    NeighborhoodSelectComponent,
    AddressRouteSelectComponent,
    AddressZoneSelectComponent,
    FingerprintComponent,
    ClientSearchComponent,
    CreateAccountContentComponent,
    CountrySelectComponent,
    TypedocSelectComponent,
    ProductSelectionComponent,
    CurrencySelectComponent,
    ProductTypeSelectComponent,
    ProductSelectComponent,
    DataCustomerComponent,
    OriginFundsSelectComponent,
    AccountPurposeSelectComponent,
    PromotionsSelectComponent,
    AgenciesSelectComponent,
    OperationsSupervisorComponent,
    ClientSearchComponent,
    PortalHeaderComponent,
    AccountComponent,
    PortalAdminClientComponent,
    PortalContentComponent,
    ContentFooterComponent,
    LoginComponent,
    AdministrationInterestsComponent,
    UpdateNameComponent,
    AuthorizationComponent,
    AdministrationCheckbooksComponent,
    PortalAdminAccountComponent,
    MethodPaymentComponent,
    AccountSelectComponent,
    AddressTypeSelectComponent,
    PortalCreateClientComponent,
    CreateClientContentComponent,
    CancelConfirmationComponent,
    DependentComponent,
    RelationshipSelectComponent,
    CreateClientHeaderComponent,
    NeighborhoodSearchComponent,
    ModalComponent,
    ErrorsMessageComponent,
    PortalCreateAccountComponent,
    CreateAccountHeaderComponent,
    TypeDocumentSelectComponent,
    SalarySelectComponent,
    ReferencesComponent,
    ShareholderReferenceComponent,
    NoCustomerEmployeesComponent,
    CreditReferenceComponent,
    ReferenceTypeSelectComponent,
    BondingSelectComponent,
    AccountReferenceComponent,
    PersonalReferenceComponent,
    InsuranceReferenceComponent,
    VehicleReferenceComponent,
    AddressComponent,
    SignatureComponent,
    ElectronicServiceComponent,
    AccountCreatedComponent,
    CheckbookTypeSelectComponent,
    FrequencySelectComponent,
    JointAccountComponent,
    FrequencySelectComponent,
    BeneficiaryComponent,
    BeneficiaryFinalComponent,
    FixedTermComponent,
    AccountSelectedComponent,
    UpdateAccountNameComponent,
    DeadLineSelectedComponent,
    FooterComponent,
    GroupComponent,
    EconomicGroupComponent,
    FooterComponent,
    EconomicGroupSelectComponent,
    RoleComponent,
    UserComponent,
    ProfileComponent,
    UserDetailComponent,
    ProfileSelectComponent,
    RoleDetailComponent,
    ProfileDetailComponent,
    RoleDualListComponent,
    TransferAccountComponent,
    AccountDualListComponent,
    MenuComponent,
    DualListAccountComponent,
    UpdateIdComponent,
    ReferenciasClienteComponent,
    EconomicRelationSelectComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    MenuModule,
    ReportModule,
    SearchModule,
    SecurityModule.forRoot({useJWT: false, endpoint: environment.apiUrl + '/oauth/token'}),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (httpFactory),
      deps: [Http]
    }),
    Ng2SmartTableModule,
    PopoverModule,
    AppRoutingModule,
    BackOfficeAceModule,
    TextMaskModule,
    CoreModule,
    DatePickerModule,
    DataTableByteModule,
    UserModule,
    BasicMaintenanceModule.forRoot({
      resourceClient: SecurityService,
    }),
  ],
  providers: [NavigationService, PartialPersistService, ValidationsService, ChangeService],
  bootstrap: [AppComponent],
  exports: [AppComponent]
})
export class AppModule {
}
