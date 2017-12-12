import {EventEmitter, Injectable} from '@angular/core';
import {Navigation} from '../navigation';
import {Section} from '../section';

@Injectable()
export class NavigationService {

  navigationChange: EventEmitter<any> = new EventEmitter();
  nameChange: EventEmitter<any> = new EventEmitter();
  idChange: EventEmitter<any> = new EventEmitter();
  public client = {
    natural: false,
    legal: false,
    salaried: false,
    merchant: false,
    both: false,
    minorOld: false,
    thirdOld: false,
    notExistsInRegistry: false
  };

  public account = {
    futuroCrece: false,
    product: false,
    dataCustomer: false,
    joint: false,
    interest: false,
    checkbook: false,
    fixed: false,
    beneficiaries: false,
    beneficiariesFinal: false,
    jointRequired: false,
    accountCreated: false,
    signatureRequired: false,
    finalRequired: false,
    transferAccount: false,
    transferRequired: false,
    specialProduct: false
  };

  availableSections: Navigation[] = [
    {section: Section.naturalGeneralData, status: false},
    {section: Section.legalGeneralData, status: false},
    {section: Section.economicProfile, status: false},
    {section: Section.businessDataLegal, status: false},
    {section: Section.providerReference, status: false},
    {section: Section.legalRepresentative, status: false},
    {section: Section.additionalData, status: false},
    {section: Section.documents, status: false},
    {section: Section.addressInformation, status: false},
    {section: Section.customerCreated, status: false},
    {section: Section.dependentReference, status: false},
    {section: Section.laboralReference, status: false},
    {section: Section.productSelection, status: false},
    {section: Section.dataCustomer, status: false},
    {section: Section.reference, status: false},
    {section: Section.administrationInterests, status: false},
    {section: Section.administrationCheckbooks, status: false},
    {section: Section.signature, status: false},
    {section: Section.electronicService, status: false},
    {section: Section.jointAccount, status: false},
    {section: Section.fixedTerm, status: false},
    {section: Section.accountCreated, status: false},
    {section: Section.beneficiaries, status: false},
    {section: Section.beneficiariesFinal, status: false},
    {section: Section.fingerReader, status: false},
    {section: Section.faceReader, status: false},
    {section: Section.transferAccount, status: false}
  ];
  currentSections: Navigation[] = [
    {section: Section.personType, status: false},
    {section: Section.productSelection, status: false}
  ];

  constructor() {
  }

  selectLastActiveSection(): void {
    this.navigationChange.emit({
      prevSection: undefined,
      section: this.currentSections[this.currentSections.length - 1].section,
      status: true
    });
  }

  selectLastSection(item: Navigation): void {
    this.currentSections.push(item);
    this.navigationChange.emit({
      prevSection: undefined,
      section: this.currentSections[this.currentSections.length - 1].section,
      status: true
    });
  }

  selectEditNavigation(item: Section): void {
    this.navigationChange.emit({
      prevSection: undefined,
      section: item,
      status: true
    });
  }

  public navigateTo(prevSection: Section, section: Section, status: boolean): void {
    const sectionFound = this.availableSections.find((item: Navigation) => section === item.section);
    const currentSection = this.currentSections.find((item: Navigation) => prevSection === item.section);
    if (currentSection) {
      currentSection.status = status;
    }
    if (sectionFound) {
      this.availableSections.splice(this.availableSections.indexOf(sectionFound), 1);
      sectionFound.status = false;
      this.currentSections.push(sectionFound);

      if (prevSection === Section.personType && section === Section.legalGeneralData) {
        const generalData = this.currentSections.find((item: Navigation) => Section.naturalGeneralData === item.section);
        if (generalData) {
          this.currentSections.splice(this.currentSections.indexOf(generalData), 1);
          this.availableSections.push(generalData);
        }
        const economicProfile = this.currentSections.find((item: Navigation) => Section.economicProfile === item.section);
        if (economicProfile) {
          this.currentSections.splice(this.currentSections.indexOf(economicProfile), 1);
          this.availableSections.push(economicProfile);
        }

      } else if (prevSection === Section.personType && section === Section.naturalGeneralData) {
        const generalData = this.currentSections.find((item: Navigation) => Section.legalGeneralData === item.section);
        if (generalData) {
          this.currentSections.splice(this.currentSections.indexOf(generalData), 1);
          this.availableSections.push(generalData);
        }
        const economicProfile = this.currentSections.find((item: Navigation) => Section.economicProfile === item.section);
        if (economicProfile) {
          this.currentSections.splice(this.currentSections.indexOf(economicProfile), 1);
          this.availableSections.push(economicProfile);
        }

      }
      if (prevSection === Section.economicProfile && section === Section.businessDataLegal) {
        const businessDataLegal = this.currentSections.find((item: Navigation) => Section.businessDataLegal === item.section);
        if (businessDataLegal) {
          this.currentSections.push(businessDataLegal);
        }
      }

    }
    this.navigationChange.emit({prevSection: prevSection, section: section, status: status});
  }

  public goBack(section: Section): void {
    const sectionFound = this.currentSections.find((item: Navigation) => section === item.section);
    if (sectionFound) {
      this.currentSections.splice(this.currentSections.indexOf(sectionFound), 1);
      sectionFound.status = false;
      this.availableSections.push(sectionFound);
    }
  }

  public removeSections(sections: Section[]): void {
    sections.forEach(section => {
      const sectionFound = this.currentSections.filter((item: Navigation) => section === item.section);
      if (sectionFound && sectionFound.length > 0) {
        sectionFound.forEach(item => {
          const removed = this.currentSections.splice(this.currentSections.indexOf(item), 1);
          item.status = false;
        });
        this.availableSections.push(sectionFound[0]);
      }
    });
  }

  public isActiveSection(section: Section): Navigation {
    return this.currentSections.find((item: Navigation) => section === item.section);
  }

  public cleanUp(currentSections?: Navigation[], availableSections?: Navigation[]): void {
    if (currentSections && currentSections.length && availableSections && currentSections.length) {
      this.availableSections = availableSections.map(i => i);
      this.currentSections = currentSections.map(i => i);
    } else {
      this.availableSections = [
        {section: Section.naturalGeneralData, status: false},
        {section: Section.legalGeneralData, status: false},
        {section: Section.economicProfile, status: false},
        {section: Section.businessDataLegal, status: false},
        {section: Section.providerReference, status: false},
        {section: Section.legalRepresentative, status: false},
        {section: Section.additionalData, status: false},
        {section: Section.documents, status: false},
        {section: Section.addressInformation, status: false},
        {section: Section.customerCreated, status: false},
        {section: Section.dependentReference, status: false},
        {section: Section.laboralReference, status: false},
        {section: Section.productSelection, status: false},
        {section: Section.dataCustomer, status: false},
        {section: Section.reference, status: false},
        {section: Section.administrationInterests, status: false},
        {section: Section.administrationCheckbooks, status: false},
        {section: Section.signature, status: false},
        {section: Section.electronicService, status: false},
        {section: Section.jointAccount, status: false},
        {section: Section.fixedTerm, status: false},
        {section: Section.accountCreated, status: false},
        {section: Section.beneficiaries, status: false},
        {section: Section.beneficiariesFinal, status: false},
        {section: Section.faceReader, status: false},
        {section: Section.fingerReader, status: false},
        {section: Section.transferAccount, status: false}
      ];

      this.currentSections = [
        {section: Section.personType, status: false},
        {section: Section.productSelection, status: false}
      ];
    }
    ;
    this.account = JSON.parse(JSON.stringify(this.cleanAccount));
  }

  public cleanAccount = {
    futuroCrece: false,
    product: false,
    dataCustomer: false,
    joint: false,
    interest: false,
    checkbook: false,
    fixed: false,
    beneficiaries: false,
    beneficiariesFinal: false,
    jointRequired: false,
    accountCreated: false,
    signatureRequired: false,
    finalRequired: false,
    transferAccount: false,
    transferRequired: false,
    specialProduct: false
  };

}
