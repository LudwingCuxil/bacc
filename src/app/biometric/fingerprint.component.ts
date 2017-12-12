import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {Fingerprint} from './shared/fingerprint';
@Component({
  selector: 'pl-fingerprint',
  templateUrl: './fingerprint.component.html',
  styleUrls: ['./fingerprint.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FingerprintComponent implements OnInit {

  fingerprint : Fingerprint = new Fingerprint();

  constructor() { }

  ngOnInit() {
  }

}
