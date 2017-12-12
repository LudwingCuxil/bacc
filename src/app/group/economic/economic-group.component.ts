import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Nacionalidad} from '../../shared/client/nacionalidad';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import {PlParameterService} from '../../pl-parameter/shared/pl-parameter.service';
import {GroupService} from '../shared/group.service';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';
import {EconomicGroup} from '../shared/economic-group';

@Component({
  selector: 'pl-economic-group-profile-select',
  templateUrl: './economic-group.component.html',
  styles: [],
  providers: [GroupService]
})
export class EconomicGroupComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: EconomicGroup[];
  @Input() groupSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeGroup: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() group = new EconomicGroup();
  groups: EconomicGroup[] = [];
  private PARAM_PAISDE = 'PARAM_PAISDE';
  resultOptionsSubject: Subject<any> = new Subject<any>();
  defaultValue: string;

  // @ViewChild('selectAuto');

  constructor(private _plService: PlParameterService, private _groupService: GroupService) {
    this.changeGroup = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'group';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.id  && input.value.id != null && input.value.id.grupo) {
          return null;
        }
      }
    }
    return {
      'required': true
    };
  }

  ngOnInit() {
    if (!this.options) {
      this._groupService.getGroups()
        .then((groups: any) => {
          this.groups = groups;
        });
    } else {
      this.groups = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: EconomicGroup) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.groups.slice(0, 20);
      }
      if (terms.term) {
        return this.groups.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.groups.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['groupSelected'] !== undefined) {
      if (changes['groupSelected'].currentValue !== undefined && changes['groupSelected'].currentValue !== null) {
        if (this.groups) {
          const group = this.groups.find((item) => item.id.tipoGrupo === changes['groupSelected'].currentValue.id.tipoGrupo && item.id.grupo === changes['groupSelected'].currentValue.id.grupo);
          if (group) {
            this.group = group;
          }
        }
      }
    }

    if (changes['group'] !== undefined && changes['group'].currentValue !== undefined) {
      if (this.groups) {
        const group = this.groups.find((item) => item.id.tipoGrupo === changes['group'].currentValue.id.tipoGrupo && item.id.grupo === changes['group'].currentValue.id.grupo);
        if (group) {
          this.group = group;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeGroup.emit(newObj.item);
    } else {
      this.changeGroup.emit(newObj);
    }
  }
}
