/**
 * Created by elioth010 on 5/22/17.
 */
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Address} from '../shared/address';
import {NeighborhoodService} from '../shared/neighborhood.service';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotificationsService} from 'angular2-notifications';


@Component({
  selector: 'pl-neighborhood-search',
  templateUrl: './neighborhood-search.component.html',
  styleUrls: ['./neighborhood-search.component.css'],
  providers: [NeighborhoodService]
})

export class NeighborhoodSearchComponent implements OnInit {

  neighborhood = new Address();
  neighborhoods: Address[] = [];
  @Input() options: Address[];
  @Input() disabled = false;
  @Output() changeNeighborhood: EventEmitter<any>;

  heading: string[] = ['neighborhood.neighborhood', 'neighborhood.region', 'neighborhood.department', 'neighborhood.municipality'];
  values: string[] = ['nombreLugar4', 'nombreLugar1', 'nombreLugar2', 'nombreLugar3'];

  neighborhoodForm: FormGroup;
  neighborhoodSearch: AbstractControl;
  neighborhoodName: string;
  busy: Promise<any>;
  model: any;

  constructor(private neighborhoodService: NeighborhoodService, private formBuilder: FormBuilder, private notificationService: NotificationsService) {
    this.changeNeighborhood = new EventEmitter<any>();
    this.neighborhoodForm = this.formBuilder.group({
      neighborhoodSearch: [{
        value: '',
        disabled: this.disabled
      }, Validators.compose([Validators.required, Validators.maxLength(30)])]
    });

    this.neighborhoodSearch = this.neighborhoodForm.controls['neighborhoodSearch'];
  }

  ngOnInit(): void {
  }

  findNeighborhood(): void {
    this.busy = this.neighborhoodService.searchNeighborhoods(this.neighborhoodName);
    this.busy.then((neightborhoods: any) => this.neighborhoods = neightborhoods)
      .catch(e => this.handleError(e));
  }

  selectNeighborhood(newObj: any) {
    this.changeNeighborhood.emit(newObj);
  }

  handleError(error: any): void {
    if (error.status === 404) {
      let body = '';
      if (error._body !== '') {
        try {
          body = JSON.parse(error._body).message;
        } catch (e) {
          body = error._body;
        }
      }
      this.notificationService.alert('No found 404!', 'The server response 404 : \n' + body);
    } else if (error.status === 400) {
      let body = '';
      if (error._body !== '') {
        try {
          body = JSON.parse(error._body).message;
        } catch (e) {
          body = error._body;
        }
      }
      this.notificationService.error('Internal Error', 'The server response 500 error : \n' + body);
    } else if (error.status === 401) {
      let body = '';
      if (error._body !== '') {
        try {
          body = JSON.parse(error._body).error_description;
        } catch (e) {
          body = error._body;
        }
      }
      this.notificationService.error('Internal Error', 'The server response 401 error : \n' + body);

    } else if (error.status === 500) {
      let body = '';
      if (error._body !== '') {
        try {
          body = JSON.parse(error._body).message;
        } catch (e) {
          body = error._body;
        }
      }
      this.notificationService.error('Internal Error', 'The server response 500 error : \n' + body);
    } else if (error._body !== '') {
      let body = '';
      try {
        body = JSON.parse(error._body).message;
      } catch (e) {
        body = error._body;
      }
      this.notificationService.error('An error occurred, status: ' + error.status, body);
    }
  }
}
