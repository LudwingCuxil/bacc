import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, AfterViewChecked, ChangeDetectorRef} from '@angular/core';
import {NavigationService} from '../../shared/services/navigation.service';
import {NgbTabset} from '@ng-bootstrap/ng-bootstrap-byte';
import {Navigation} from '../../shared/navigation';
import {Section} from '../../shared/section';
import {isUndefined} from 'util';
import {Subject} from 'rxjs/Subject';
import {CreateClientHeaderComponent} from '../portal-header/create-client-header.component';
import {PartialPersistService} from '../../shared/services/partial-persist.service';
import {ClienteDto} from '../../shared/client/cliente-dto';

@Component({
  selector: 'pl-create-client-content',
  templateUrl: './create-client-content.component.html',
  styleUrls: ['./portal-content.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbTabset]
})
export class CreateClientContentComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild(NgbTabset) portal;
  @ViewChild(CreateClientHeaderComponent) header: CreateClientHeaderComponent;
  subscription: Subject<any>;

  section = Section;
  public options = {
    timeOut: 5000,
    lastOnBottom: true,
    clickToClose: true,
    maxLength: 0,
    maxStack: 7,
    showProgressBar: true,
    pauseOnHover: true,
    preventDuplicates: false,
    preventLastDuplicates: 'visible',
    rtl: false,
    animate: 'scale',
    position: ['right', 'top']
  };
  client: ClienteDto;

  constructor(private config: NgbTabset, private _navigationService: NavigationService, private _partialPersistServce: PartialPersistService, private _changeDetectorRef: ChangeDetectorRef) {
    config.destroyOnHide = false;
    _navigationService.cleanUp();
    if (this._partialPersistServce.data) {
      this._partialPersistServce.data = undefined;
    }
  }

  ngOnInit() {
    if (this._navigationService) {
      this.subscription = this._navigationService.navigationChange.subscribe(navigation => {
        if (navigation) {
          this.portal.select(navigation.section);
          this.header.updateClient();
        }
        this.client = this._partialPersistServce.data;
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  isActiveSection(section: Section): Navigation {
    if (!isUndefined(section)) {
      // this.portal.select('natural');
      // this.personType
      const navigationObject = this._navigationService.isActiveSection(section);
      if (!navigationObject) {
        return;
      }
      return navigationObject;
    }
  }

  navigateSection(navigate: any) {
    this._navigationService.navigateTo(navigate.prevSection, navigate.section, navigate.status);
    this.portal.select(navigate.section);
  }


  notifyHeader(): void {
    this.header.updateClient();
  }
}
