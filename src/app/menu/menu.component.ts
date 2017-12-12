import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MenuComponent as MenuComponentSecurity} from 'security-angular/src/app/menu/menu.component';
import {Menu} from './menu';
import {TranslateService} from 'ng2-translate';
import {NotificationsService} from 'angular2-notifications';
import {Router} from '@angular/router';
import {SecurityService} from 'security-angular/src/app/security';
import {UserService} from '../security/user/shared/user.service';
declare const $: any;

@Component({
  selector: 'pl-menu',
  animations: [
    trigger('visibilityChanged', [
      state('true', style({opacity: 1, zIndex: 5, display: 'block'})),
      state('false', style({opacity: 0, display: 'none'})),
      transition('true => false', animate('150ms')),
      transition('false => true', animate('250ms'))
    ]),
    trigger('sCategoryVisibility', [
      state('true', style({opacity: '1', right: '8.33333333%'})),
      state('false', style({opacity: '0', right: '0%'})),
      transition('false => true', animate('100ms ease-in')),
      transition('true => false', animate('100ms ease-out'))
    ])
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  providers: [UserService],
  encapsulation: ViewEncapsulation.None
})
export class MenuComponent extends MenuComponentSecurity implements OnInit {

  @Input() menus: Menu[] = undefined;
  categories: Menu[];
  public profileData: any;
  public profile: any;

  constructor(private _routerV: Router,
              private _securityServiceV: SecurityService,
              private _notificationServiceV: NotificationsService,
              private _translateV: TranslateService,
              private userService: UserService) {
    super(_routerV, _securityServiceV, _notificationServiceV, _translateV);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterCategories();
  }

  async getFilterCategories() {
    this.profileData = await this.userService.getDetailUserByUsername();
    const innerCategories = JSON.parse(JSON.stringify(this.categories));

    if (this.profileData && this.profileData.roles && this.profileData.roles.length) {
      const nameCategory = this.profileData.roles.filter((item) => item.padre === 0);
      const nameSubCategory = this.profileData.roles.filter((item) => item.padre !== 0);

      if (nameCategory && nameCategory.length && nameSubCategory && nameSubCategory.length) {
        const tmpCategories = [];
        nameCategory.forEach(item => {
          const category = innerCategories.find(name => name.name.toUpperCase() === item.nombre.toUpperCase());
          if (category) {
            const subCategories = [];
            nameSubCategory.forEach(subMenu => {
              const subCategory = category.subMenus.find(nameSub => nameSub.name.toUpperCase() === subMenu.nombre.toUpperCase());
              if (subCategory) {
                subCategories.push(subCategory);
              }
            });
            category.subMenus = subCategories.sort((a, b) => a.id - b.id);
            tmpCategories.push(category);
          }
        });
        this.categories = JSON.parse(JSON.stringify(tmpCategories)).sort((a, b) => a.id - b.id);
        //console.log(this.categories);
      }
    }
  }
}
