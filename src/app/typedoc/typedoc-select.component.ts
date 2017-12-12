import {Component, EventEmitter, Input, Output, SimpleChanges, OnInit,ViewChild} from "@angular/core";
import {TypedocService} from "./shared/typedoc.service";
import { TypedocSelectComponent as ParentTypedocSelectComponent } from 'backoffice-ace/src/app/core/typedoc/typedoc-select.component';
import { Http }  from '@angular/http';
import {Typedoc} from "backoffice-ace/src/app/core/typedoc/shared/typedoc";
import {Injectable, Optional} from "@angular/core";

@Component({
  selector: 'pl-core-typedoc-select',
  template : require('backoffice-ace/src/app/core/typedoc/typedoc-select.component.html'),
  providers : [TypedocService]
})

@Injectable()
export class TypedocSelectComponent implements OnInit {

  @Input()  options : Typedoc[];
  @Input()  typedocSelected: string;
  @Input() disabled : boolean = false;
  @Input() modeView : boolean;
  @Input() modeDelete : boolean;



  items: Object[] = [];



  public mask = "";
  public mascara = [];

  @Input() autocomplete : boolean = false;
  public typedoc = new Typedoc();



 ngOnInit() {
    // console.log("Dios Quiera q");
    // this.recargar("?tipoPersona=A");
  }


  recargar(tipoPersona:string) {
    if(!this.options){
      this.typedocService2.getDocuments({number: 0, size: 1500},tipoPersona)
        .then((typedocs:any) => {
          this.typedocs = typedocs;
          for (var i = 0; i < this.typedocs.length; i++) {
            this.typedocs[i].descripcion = this.typedocs[i].descripcion.trim();
          }
          // console.log("doctos",this.typedocs)
        });

    }else{
      this.typedocs = this.options;
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if(changes['typedocSelected']!==undefined){
      if (changes['typedocSelected'].currentValue !== undefined) {
//      this.count = this.count +1;
//      if (this.count == 1) {
        //this.typedocService2.getDetailDocument(changes['typedocSelected'].currentValue)
          //.then((typedoc : Typedoc) => this.typedoc = typedoc);
//      }
      }
    }
  }


  uploadComplete(typePerson:string,url:string) {
    //this.recargar(url,"?tipoPersona="+typePerson)
  }




  public typedocs: Typedoc[];
  count : number = 0;

  constructor(private typedocService2: TypedocService) {
      //this.typedocService2.setEndpoint("dfasfdasfdas");
     //super(typedocService2);

     this.changeTypedoc = new EventEmitter<any>();

  }

  @Output() changeTypedoc: EventEmitter<any>;


  onChangeObj(newObj:any) {
    let result = this.typedocs.filter(item => item.descripcion == newObj)[0];
    let m = result.mascara.toString();
    this.mascara = [];
    for (var i = 0, len = m.length; i < len; i++) {

      if(m[i] == 'N'){
        let newName = /[0-9]/;
        this.mascara.push(newName);
      }

      if(m[i] == '@'){
        let newName = /[A-Z|0-9|-]/;
        this.mascara.push(newName);
      }

     if(m[i] == ' '){
        let newName = ' ';
        this.mascara.push(newName);
      }
    }
    this.changeTypedoc.emit(this.mascara);
  }



}


