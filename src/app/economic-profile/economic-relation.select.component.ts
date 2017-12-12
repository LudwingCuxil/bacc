import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
//import {Nacionalidad} from '../shared/client/nacionalidad';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {EmploymentSituation} from '../pl-parameter/shared/employment-situation';
import {PlParameter} from '../pl-parameter/shared/pl-parameter';

@Component({
  selector: 'pl-economic-relation-select',
  templateUrl: './economic-relation.select.component.html',
  styleUrls: ['./economic-relation.select.component.css'],
  providers: [PlParameterService]
})

export class EconomicRelationSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: EmploymentSituation[];
  @Input() economicRelationSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeEconomicRelation: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() economicRelation = new EmploymentSituation();
  economicRelations: EmploymentSituation[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();
  public plParameters: PlParameter[];

  // @ViewChild('selectAuto');

  constructor(public plParameterService: PlParameterService) {
    this.changeEconomicRelation = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'relacionEconomica';
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

  ngOnInit() {
    if (!this.options) {
      /*this.catalogService.getCatalog('rangoSueldos')
        .then((economicRelations: any) => {
          this.economicRelations = economicRelations; 
          if (this.economicRelation != null && this.economicRelation.codigo != null) {
            const economicRelationFind = this.economicRelations.find((item) => item.codigo === this.economicRelation.codigo);
            this.economicRelation = economicRelationFind;
          }
        });*/
      this.plParameterService.getplParameter({number: 0, size: 1500}, 'listas?codigoEntidad=CLIENTE&lista=SITUEMPLEO')
      .then((plParameters: any) => {
        this.plParameters = plParameters;
        for (let i = 0; i < this.plParameters.length; i++) {
          const em = new EmploymentSituation();
          em.descripcion = plParameters[i].descripcion;
          em.codigo = parseInt(plParameters[i].id.codigo.trim(), 10);
          this.economicRelations.push(em);
        }
        if(this.economicRelation) {
          if(this.economicRelation.codigo) {
            const findRelation = this.economicRelations.filter((item)=> item.codigo === this.economicRelation.codigo)[0];
            if (findRelation) {
              this.economicRelation = findRelation;
              this.changeEconomicRelation.emit(findRelation);
            }
          }
        }
      });
    } else {
      this.economicRelations = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: EmploymentSituation) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.economicRelations.slice(0, 20);
      }
      if (terms.term) {
        return this.economicRelations.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.economicRelations.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['economicRelationSelected'] !== undefined) {
      if (changes['economicRelationSelected'].currentValue !== undefined && changes['economicRelationSelected'].currentValue !== null) {
        if (this.economicRelations) {
          const economicRelation = this.economicRelations.find((item) => item.codigo === changes['economicRelationSelected'].currentValue.codigo);
          if (economicRelation) {
            this.economicRelation = economicRelation;
          }
        }
      }
    }

    if (changes['economicRelation'] !== undefined) {
      if (this.economicRelations && changes['economicRelation'].currentValue) {
        const economicRelation = this.economicRelations.find((item) => item.codigo === changes['economicRelation'].currentValue.codigo);
        if (economicRelation) {
          this.economicRelation = economicRelation;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeEconomicRelation.emit(newObj.item);
    } else {
      if (this.economicRelation){
        if (this.economicRelation.descripcion) {
          this.changeEconomicRelation.emit(newObj);
        }
      }
    }
  }

}
