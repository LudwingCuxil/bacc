import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Institucion} from '../shared/client/institucion';
import {InstitutionService} from './shared/institution.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {TipoInstitucion} from '../shared/client/tipo-institucion';

@Component({
  selector: 'pl-institution-select',
  templateUrl: './institution.select.component.html',
  providers: [InstitutionService],
  styleUrls: ['./institution.select.component.css']
})

export class InstitutionSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Institucion[];
  @Input() institutionSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeInstitution: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() institution = new Institucion();
  @Input() institutionType: TipoInstitucion;
  institutions: Institucion[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public institutionService: InstitutionService) {
    this.changeInstitution = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'institution';
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
      this.institutionService.getInstitutionService(null)
        .then((institutions: any) => {
          this.institutions = institutions;
          if (this.institution != null && this.institution.codigo != null && this.institutionType != null ) {
            const institutionFind = this.institutions.find((item) => item.codigo === this.institution.codigo && item.tipoInstitucion.codigo === this.institutionType.codigo);
            this.institution = institutionFind;
          }else{
          if (this.institution != null && this.institution.codigo != null ) {
            const institutionFind = this.institutions.find((item) => item.codigo === this.institution.codigo);
            this.institution = institutionFind;
          }
          }
        });
    } else {
      this.institutions = this.options;
    }


    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }


  public selectInstitutions(types) {
//     if(!this.options){
//      this.sectorService.getSectorService({number: 0, size: 1500},types)
//        .then((sectors:any) => {
//            this.sectors = [];
//           for (var i = 0; i < sectors.length; i++) {
//            this.sectors.push(new Sector(sectors[i].codigo,sectors[i].descripcion));
//          }
//          console.log("sector",this.sectors)
//        });
//
//    }else{
//      this.sectors = this.options;
//    }

    if (!this.options) {
      this.institutionService.getInstitutionService(types)
        .then((institutions: any) => {
          this.institutions = institutions;
          if (this.institution != null && this.institution.codigo != null) {
            const institutionFind = this.institutions.find((item) => item.codigo === this.institution.codigo);
            this.institution = institutionFind;
          }
        });
    } else {
      this.institutions = this.options;
    }

  }

  formatter = (result: Institucion) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.institutions.slice(0, 20);
      }
      if (terms.term) {
        return this.institutions.filter(v =>
        v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.institutions.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['institutionSelected'] !== undefined) {
      if (changes['institutionSelected'].currentValue !== undefined && changes['institutionSelected'].currentValue !== null) {
        if (this.institutions) {
          const institution = this.institutions.find((item) => item.codigo === changes['institutionSelected'].currentValue);
          if (institution) {
            this.institution = institution;
          }
          else{
              this.institution.codigo = changes['institutionSelected'].currentValue;
          }

        }
      }
    }

    if (changes['institution'] !== undefined) {
      this.institution = changes['institution'].currentValue;
      if (this.institutions) {
        const institution = this.institutions.find((item) => item.codigo === changes['institution'].currentValue.codigo && item.tipoInstitucion.codigo === this.institutionType.codigo);
        if (institution) {
          this.institution = institution;
        }
      }
    }

    if (changes['institutionType'] !== undefined) {
      if (changes['institutionType'].currentValue !== undefined && changes['institutionType'].currentValue !== null) {
        if (this.institutions) {
          this.institutionService.getInstitutionService(changes['institutionType'].currentValue.codigo)
            .then((institutions: any) => {
              this.institutions = institutions;
            });
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeInstitution.emit(newObj.item);
    } else {
      this.changeInstitution.emit(newObj);
    }
  }

}
