import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DocumentoIdentificacion} from '../shared/client/documento-identificacion';
import {TypeDocumentService} from './shared/type-document.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject, isUndefined} from 'util';

@Component({
  selector: 'pl-type-document-select',
  templateUrl: './type-document-select.component.html',
  providers: [TypeDocumentService],
  styleUrls: ['./type-document-select.component.css']
})

export class TypeDocumentSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: DocumentoIdentificacion[];
  @Input() documentIdentificationSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeTypeDocument: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() documentIdentification = new DocumentoIdentificacion();
  @Input() clientType: string;
  public documentIdentifications: DocumentoIdentificacion[] = [];
  private typePerson = null;
  private documentSelect;
  private placeHolder;
  private items: Object[] = [];
  private mask = '';
  private maskCharacter = '';
  private mascara = [];
  private regex;

  private typedoc = new DocumentoIdentificacion();
  private typedocDefault = new DocumentoIdentificacion();
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public typeDocumentService: TypeDocumentService) {
    this.changeTypeDocument = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'documentIdentification';
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
      'required': false
    };
  }

  ngOnInit() {
    if(isUndefined(this.clientType)){
      this.clientType='A';
    }
    if (!this.options) {
      this.typeDocumentService.getDocumentItentification(this.clientType)
        .then((documentIdentifications: any) => {
          this.documentIdentifications = documentIdentifications;
          if (this.documentIdentification != null && this.documentIdentification.codigo != null) {
            const documentIdentificationFind = this.documentIdentifications.find((item) => item.codigo === this.documentIdentification.codigo);
            this.documentIdentification = documentIdentificationFind;
          }
        });

    } else {
      this.documentIdentifications = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: DocumentoIdentificacion) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.documentIdentifications.slice(0, 20);
      }
      if (terms.term) {
        return this.documentIdentifications.filter(v => this.showNationality ? v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1
          : v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.documentIdentifications.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: false});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentIdentificationSelected'] !== undefined) {
      if (changes['documentIdentificationSelected'].currentValue !== undefined && changes['documentIdentificationSelected'].currentValue !== null) {
        if (this.documentIdentifications) {
          const documentIdentification = this.documentIdentifications.find((item) => item.codigo === changes['documentIdentificationSelected'].currentValue);
          if (documentIdentification) {
            this.documentIdentification = documentIdentification;
            this.modifiMask(this.documentIdentification);
          }
        }
      }
    }
    if (changes['documentIdentification'] !== undefined) {
      if (this.documentIdentifications) {
        if (changes['documentIdentification'].currentValue != null) {
          const documentIdentification = this.documentIdentifications.find((item) => item.codigo === changes['documentIdentification'].currentValue.codigo);
          if (documentIdentification) {
            this.documentIdentification = documentIdentification;
            this.modifiMask(this.documentIdentification);
          }
        }
      }
    }
    if (changes['clientType'] !== undefined){
      // this.typeDocumentService.getDocumentItentification(this.clientType)
      //   .then((documentIdentifications: any) => {
      //     this.documentIdentifications = documentIdentifications;
      //       if (this.documentIdentification != null) {
      //        const documentIdentificationFind = this.documentIdentifications.find((item) => item.codigo === this.documentIdentification.codigo);
      //        this.documentIdentification = documentIdentificationFind;
      //      }
      //   });
      if (this.clientType){
        this.documentIdentifications =  JSON.parse(JSON.stringify(this.documentIdentifications.filter(
          (item) => item.tipoPersona === this.clientType || item.tipoPersona==='A')));
        const documentIdentificationFind = this.documentIdentifications.find((item) => item.codigo === this.documentIdentification.codigo);
        if (documentIdentificationFind) {
          this.documentIdentification = documentIdentificationFind;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (newObj) {
      this.modifiMask(newObj);
    }
    if (this.autocomplete) {

      this.changeTypeDocument.emit(newObj.item);
    } else {

      this.changeTypeDocument.emit(newObj);
    }
  }


  public modifiMask(newObj: any) {
    if (newObj != null && newObj.mascara != null) {
      const m = newObj.mascara.toString();
      this.mascara = [];
      this.placeHolder = m;
      let validMask = '';


      for (let i = 0; i < m.length; i++) {

        if (m[i] === 'N') {
          const newName = /[0-9]/;
          validMask += '[0-9]';
          this.mascara.push(newName);
          this.maskCharacter = 'N';
        }

        if (m[i] === '@') {
          const newName = /[A-Z|a-z|0-9]*\s*/;
          validMask += '[A-Z|a-z|0-9]*\\s*';
          this.maskCharacter = '@';
          this.mascara.push(newName);
        }
        if (m[i] === '-') {
          const newName = '-';
          validMask += '-';
          this.mascara.push(newName);
        }

        if (m[i] === ' ') {
          const newName = ' ';
          validMask += ' ';
          this.mascara.push(newName);
        }
      }
      this.regex = new RegExp(validMask);
    }
  }

  public getMaskCharacter(): any {
    return this.maskCharacter;
  }

  public getDocument(): any {
    return this.typedoc;
  }

  public getPlaceHolder(): any {
    return this.placeHolder;
  }

  public setPlaceHolder(placeHolder2) {
    this.placeHolder = placeHolder2;
  }

  public obtainRegex(): any {
    return this.regex;
  }

  public setDocument(doc) {
    this.documentSelect = '';
    this.typedoc = doc;
    this.documentIdentificationSelected = this.typedoc.codigo;
    this.documentIdentification = doc;
    this.onChangeObj(doc);
  }

  public setDocumentDefault(documentDefault) {
    this.typedocDefault = documentDefault;
  }

  public clearTypeDocument() {
    this.typedoc = new DocumentoIdentificacion();
  }

  public updateTypeDocument(url: string, typePersont: string): any {
    this.recargar(url, typePersont);
    this.typePerson = typePersont;
  }
  // private documentIdentifications: DocumentoIdentificacion[] = [];

  public recargar(value, parameter) {
    this.documentSelect = '';
    // this.typeDocumentService.setEndpoint(value);
    if (!this.options) {
      this.typeDocumentService.getDocumentItentification(parameter)
        .then((documentIdentifications: any) => {
          this.documentIdentifications = documentIdentifications;
          for (let i = 0; i < this.documentIdentifications.length; i++) {
            this.documentIdentifications[i].descripcion = this.documentIdentifications[i].descripcion.trim();
          }
          if (this.typedocDefault != null) {
            this.setDocument(this.typedocDefault);
          }
        });

    } else {
      this.documentIdentifications = this.options;
    }
  }

}
