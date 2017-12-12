import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

import {CivilStatusService} from './shared/civil-status.service';
import {DetailParameter} from './shared/parameter';
import {FormControl, FormGroup} from '@angular/forms';
import {isObject} from 'util';


@Component({
  selector: 'pl-civil-status-select',
  templateUrl: './civil-status.select.component.html',
  styleUrls: ['./civil-status.select.component.css'],
  providers: [CivilStatusService]
})
export class CivilStatusSelectComponent implements OnInit, OnChanges {

  @Output() changeCivilStatus: EventEmitter<any>;
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: DetailParameter[];
  @Input() civilStatusSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;

  @Input() autocomplete = false;
  private civilStatus = new DetailParameter();

  private civilStatusList: DetailParameter[];
  private permission = 'PARAM_ECIVIL';

  constructor(private civilStatusService: CivilStatusService) {
    this.changeCivilStatus = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'civilStatus';
    }
  }

  async ngOnInit() {
    if (!this.options) {
      const response = await this.civilStatusService.getCivilStatus(this.permission);
      this.civilStatusList = response.valores;
      if (this.civilStatusSelected) {
        this.civilStatus = this.civilStatusList.find( item => item.valor === this.civilStatusSelected);
      }
    } else {
      this.civilStatusList = this.options;
    }
    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.descripcion && input.value.descripcion.length > 2) {
          return null;
        }
      }
    }
    return {
      'required': true
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['civilStatusSelected'] !== undefined) {
      if (changes['civilStatusSelected'].currentValue !== undefined) {
        if (changes['civilStatusSelected'].currentValue !== undefined) {
          if (!this.civilStatusList) {
            return;
          }
          this.civilStatus = this.civilStatusList.filter(item => item.valor === changes['civilStatusSelected'].currentValue)[0];
          console.log('select status id: ' + changes['civilStatusSelected'].currentValue);
        } else {
          if (!this.civilStatusList) {
            return;
          }
          this.civilStatus = this.civilStatusList.filter(item => item.valor === changes['civilStatusSelected'].currentValue)[0];
          console.log('select status: ' + changes['civilStatusSelected'].currentValue);
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeCivilStatus.emit(newObj.item.valor);
    } else {
      this.changeCivilStatus.emit(newObj.valor);
    }
  }

}
