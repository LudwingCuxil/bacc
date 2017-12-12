import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl} from '@angular/forms';

@Component({
  selector: 'pl-errors-message',
  templateUrl: './errors-message.component.html',
  styles: [``]
})
export class ErrorsMessageComponent implements OnInit {
  @Input() withoutTouch = false;
  @Input() control: AbstractControl;
  @Input() maxLength: number;
  @Input() minLength: number;
  @Input() integer: boolean = false;
  @Input() customPatter = false;

  constructor() {
  }

  ngOnInit() {
  }

}
