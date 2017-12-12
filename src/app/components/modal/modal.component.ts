import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NavigationService} from '../../shared/services/navigation.service';
import {Router} from '@angular/router';

declare var $: any;

@Component({
  selector: 'pl-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @Output() changeModal: EventEmitter<any>;

  constructor(private navigation: NavigationService, private router: Router) {
    this.changeModal = new EventEmitter<any>();
  }

  ngOnInit() {

  }

  public check() {
    this.changeModal.emit(true);
  }

  public close() {
    this.changeModal.emit(false);
  }

}
