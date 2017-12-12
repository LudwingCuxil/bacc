import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit,ViewChild} from '@angular/core';
import {Router} from "@angular/router";

import {NotificationsService} from "angular2-notifications";
import {TranslateService} from "ng2-translate";

import {SearchDataType, SearchComponent} from "security-angular/src/app/search";

import { Client } from 'backoffice-ace/src/app/core/client-core/shared/client';
import { ClientCore } from 'backoffice-ace/src/app/core/client-core/shared/client-core';
import {ClientService} from "./shared/client.service";
import {TypedocSelectComponent } from '../typedoc/typedoc-select.component';


import {Typedoc} from "backoffice-ace/src/app/core/typedoc/shared/typedoc";
import {TypedocService} from "../typedoc/shared/typedoc.service";

@Component({
  selector: 'pl-core-client-search',
  templateUrl: 'client.search.component.html',
  styleUrls: ['client.search.component.css']
})
export class ClientSearchComponent implements OnInit {

  @Input() identificacion: any = "";
  public mask = [];
  public typedocs: Typedoc[];
  setClickedRow : Function;

  @Input() primerNombre: string = "";
  @Input() segundoNombre: string="";
  @Input() primerApellido: string="";
  @Input() segundoApellido: string="";
  @Input() codigoCliente: any ="";
  @Input() nitCliente: any ="";

  searchObject : any;
  public headers : string [] = [];
  head : string [];
  public name : string;
  public m : string;
  public countFilter :number;
  public filterExist: boolean = false

  constructor(
    private router: Router,
    public clientService: ClientService,
    public typedocService: TypedocService,
    private notificationService: NotificationsService,
    public translate : TranslateService) {

    this.changeClient = new EventEmitter<any>();
  }


 @ViewChild(TypedocSelectComponent) tipeDoc: TypedocSelectComponent

  @Output() changeClient: EventEmitter<any>;


  searchc = new SearchComponent();
  type = SearchDataType;
  example;

  changeHeaders() : void {
    this.headers = [];
    for (var x=0; x<this.head.length; x++) {
      this.translate.get(this.head[x]).subscribe((res: string) => {
        this.headers.push(res);
      });
    }
    this.translate.get('user.user').subscribe((res: string) => {
      this.name = res;
    });
  }




  /*
  let searchd = new SearchComponent();
  let searchd.fields = ['nombre'];

  type = SearchDataType;
  search.dataTypes = [type.string]
  this.searchObject = search.parseArray(["*oswaldo*", "*alfredo*", "*lopez*"]);*/

  busy: Promise<any>;
  public pager;


  ngOnInit() {
    this.client = new Client();
    this.clientcore = new ClientCore();
    this.searchc.fields = ['nombre','numeroIdentificacion','id','nit'];
    this.searchc.dataTypes = [this.type.string,this.type.string,this.type.integer,this.type.string];
   // this.tipeDoc.uploadComplete("A");


  }



  loadAll() : void {
    //this.busy = this.clientService.getClients(this.pager);
    //this.busy.then((clients)=> {this.clients = clients.content; this.pager = clients;}, (e:any) => this.handleError(e));
  }

  public textFilter : string;
  public nameEmpty : boolean =true;
  public likeTemp : string="";
  selectedRow : Number;

  search() : void {

    this.nameEmpty = true;
    this.countFilter =0;
    this.textFilter = "";
    this.filterExist = false;
    this.likeTemp ="";


    if(this.primerNombre!=null && this.primerNombre != ""){
      this.textFilter = this.textFilter + "nombre=*"+this.primerNombre+"*"; this.nameEmpty = false;
      this.countFilter ++;
      this.filterExist = true;
    }

    if(this.segundoNombre!=null && this.segundoNombre != ""){
      if(!this.nameEmpty)
        this.textFilter += " and ";

      this.textFilter = this.textFilter + "nombre=*"+this.segundoNombre+"*"; this.nameEmpty = false;
      this.countFilter ++;
      this.filterExist = true;
    }


    if(this.primerApellido!=null && this.primerApellido != ""){
      if(!this.nameEmpty)
        this.textFilter += " and ";

      this.textFilter += "nombre=*"+this.primerApellido+"*"; this.nameEmpty = false;
      this.countFilter ++;
      this.filterExist = true;
    }


    if(this.segundoApellido!=null && this.segundoApellido != ""){
      if(!this.nameEmpty)
        this.textFilter += " and ";
        this.textFilter = this.textFilter + "nombre=*"+this.segundoApellido+"*"; this.nameEmpty = false;
        this.countFilter ++;
        this.filterExist = true;
    }
    this.m ="";
    for (var i = 0, len = this.identificacion.length; i < len; i++) {
      if(this.identificacion[i] != "_"){
        this.m += this.identificacion[i];
      }
      this.filterExist = true;

    }

    if(this.codigoCliente!=null && this.codigoCliente != "")
      this.filterExist = true;

    if(this.nitCliente != null && this.nitCliente != "")
      this.filterExist = true;

    if(this.filterExist){
    if(this.codigoCliente==null){
      this.codigoCliente ="";
    }else{
      this.likeTemp = "*";
    }


    if(!this.nameEmpty){
      if(this.countFilter==1){

      }else{
        if(this.countFilter>1){
          this.textFilter = 'AND(' + this.textFilter+ ")";
        }
      }

      if(this.m != null && this.m != ""){
        this.searchObject = this.searchc.parseArray([this.textFilter,"numeroIdentificacion="+this.m+"","id.identificacion="+this.likeTemp+this.codigoCliente,"identificacionTributaria="+this.nitCliente]);
      }
      else {
        this.searchObject = this.searchc.parseArray([this.textFilter,"id.identificacion="+this.likeTemp+this.codigoCliente,"identificacionTributaria="+this.nitCliente]);
      }

    }
    else{
      this.searchObject = this.searchc.parseArray(["numeroIdentificacion="+this.m+"","id.identificacion="+this.likeTemp+this.codigoCliente,"identificacionTributaria="+this.nitCliente]);
    }







    this.busy = this.clientService.searchClients(this.searchObject, this.pager);
    this.busy.then((clients)=> {this.clients = clients.content;
        for (var i = 0; i < this.clients.length; i++) {

          let result = this.tipeDoc.typedocs.filter(item => item.codigo.indexOf(this.clients[i].tipoDeIdentificacion) !== -1);
          if(result.length>0)
          this.clients[i].tipoDeIdentificacion = result[0].descripcion.toString();

          if(this.clients[i].tipoPersona == '3'){

            let tr = this.translate.instant('client.both');this.clients[i].tipoPersona = tr.toString();
          }


          if(this.clients[i].tipoPersona == '0'){
            let tr = this.translate.instant("client.natural");this.clients[i].tipoPersona = tr.toString();
          }

          if(this.clients[i].tipoPersona == '1')
          {
            let tr = this.translate.instant("client.legal");this.clients[i].tipoPersona = tr.toString();
          }

        }
      this.pager = clients;}, (e:any) => this.handleError(e));
    }else{
      let tr = this.translate.instant("client.noparameter");
      this.notificationService.error("ERROR", tr.toString());
    }

    this.setClickedRow = function(index,i){
      this.selectedRow = i;

      this.busy = this.clientService.getDetailClientCore(index.id.identificacion);
      this.busy.then((clientcores)=> {
      this.clientcores = clientcores;
      console.log("se",this.clientcores);
        this.changeClient.emit(this.clientcores);
      });

    }

  }

  clients: Client[] = [];
  client: Client = new Client();

  clientcores: ClientCore[] = [];
  clientcore: ClientCore = new ClientCore();



  //@Input() portal-header-core: Client;
  @Input() numberDocument : "";
  @Input() codeClient : "";

  updateTable(pager : any){
    this.pager = pager;
    if(this.searchObject==undefined || this.searchObject.listParameter==undefined || this.searchObject.listParameter.length == 0){
      this.search();
      // this.loadAll();
    }else{
      this.search();
    }
  }

  selectTypedoc(event:any):void{
    this.mask = event;
  }

  handleError(error: any) : void {
    this.client = undefined;
    if(error.status == 404){
      let body="";
      if(error._body != ""){
        try{
          body = JSON.parse(error._body).message;
        }catch(e){
          body = error._body;
        }
      }
      this.notificationService.alert('No found 404!', "The server response 404 : \n"+body);
    }else if(error.status == 400){
      let body="";
      if(error._body != ""){
        try{
          body = JSON.parse(error._body).message;
        }catch(e){
          body = error._body;
        }
      }
      this.notificationService.error('Internal Error', "The server response 500 error : \n"+body);
    }else if(error.status == 401){
      let body="";
      if(error._body != ""){
        try{
          body = JSON.parse(error._body).error_description;
        }catch(e){
          body = error._body;
        }
      }
      this.notificationService.error('Internal Error', "The server response 401 error : \n"+body);
      let link = ['/login'];
      this.router.navigate(link);
    }else if(error.status == 500){
      let body="";
      if(error._body != ""){
        try{
          body = JSON.parse(error._body).message;
        }catch(e){
          body = error._body;
        }
      }
      this.notificationService.error('Internal Error', "The server response 500 error : \n"+body);
    } else if(error._body != ""){
      let body=""
      try{
        body = JSON.parse(error._body).message;
      }catch(e){
        body = error._body;
      }
      this.notificationService.error('An error occurred, status: '+error.status, body);
    }
  }



}
