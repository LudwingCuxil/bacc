import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Location} from '@angular/common';
import {NavigationService} from '../../shared/services/navigation.service';
import {PartialPersistService} from '../../shared/services/partial-persist.service';

@Component({
  selector: 'pl-create-client-header',
  templateUrl: './create-client-header.component.html',
  styleUrls: ['./portal-header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreateClientHeaderComponent implements OnInit, AfterViewChecked {
  client;

  constructor(private navigation: NavigationService, public location: Location, private partialPersistService: PartialPersistService,
              private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.client = this.partialPersistService.data;
  }

  goBack() {
    this.location.back();
    this.navigation.client.natural = false;
    this.navigation.client.legal = false;
  }

  updateClient() {
    this.client = this.partialPersistService.data;
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }


}
