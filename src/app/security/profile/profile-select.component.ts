import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ProfileService} from './shared/profile.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {Profile} from './shared/profile';

@Component({
  selector: 'pl-profile-select',
  templateUrl: './profile-select.component.html',
  providers: [ProfileService],
  styleUrls: ['./profile-select.component.css']
})

export class ProfileSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Profile[];
  @Input() profileSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeProfile: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() profile = new Profile();
  profiles: Profile[] = [];
  private PARAM_PAISDE = 'PARAM_PAISDE';
  resultOptionsSubject: Subject<any> = new Subject<any>();
  defaultValue: string;

  // @ViewChild('selectAuto');

  constructor(private profileService: ProfileService) {
    this.changeProfile = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'profile';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.nombre && input.value.nombre.length > 2) {
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
      this.profileService.getProfiles({number: 0, size: 1500})
        .then((profiles: any) => {
          this.profiles = profiles.content;
          if(this.profileSelected) {
            if (this.profiles) {
              const profile = this.profiles.find((item) => item.nombre === this.profileSelected);
              if (profile) {
                this.profile = profile;
              }
            }
          }
        });
    } else {
      this.profiles = this.options;
      if (this.profiles) {
        const profile = this.profiles.find((item) => item.nombre === this.profileSelected);
        if (profile) {
          this.profile = profile;
        }
      }
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Profile) =>
    result.nombre ? result.nombre : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.profiles.slice(0, 20);
      }
      if (terms.term) {
        return this.profiles.filter(v => v.nombre.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.profiles.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profileSelected'] !== undefined) {
      if (changes['profileSelected'].currentValue !== undefined && changes['profileSelected'].currentValue !== null) {
        if (this.profiles) {
          const profile = this.profiles.find((item) => item.nombre === changes['profileSelected'].currentValue);
          if (profile) {
            this.profile = profile;
          }
        }
      }
    }

    if (changes['profile'] !== undefined) {
      if (this.profiles) {
        const profile = this.profiles.find((item) => item.id === changes['profile'].currentValue.id);
        if (profile) {
          this.profile = profile;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeProfile.emit(newObj.item);
    } else {
      this.changeProfile.emit(newObj);
    }
  }

}
