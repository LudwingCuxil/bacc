import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'pl-portal-create-client',
  templateUrl: './portal-create-client.component.html',
  styleUrls: ['./portal-admin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PortalCreateClientComponent implements OnInit {
  busy: Promise<any>;
  options = {
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
  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
  }
}
