import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';

import {MenuType} from './menu/menu-type.enum';
import {Menu} from './menu/menu';
import {SecurityService} from 'security-angular/src/app/security';
import {TranslateService} from 'ng2-translate';
import {NavigationStart, Router} from '@angular/router';
import {LockServices} from './shared/services/lock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LockServices]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app works!';
  private menus: Menu[] = [];
  menuType = MenuType;

  public pkg = require('../../package.json');
  public appVersion = this.pkg.version;
  public footerView = true;
  public footerCompact = false;
  private notView = [
    '/',
    '/login',
    '/create',
    '/home',
    '/home/index',
    '/users',
    '/profiles',
    '/roles'
  ];

  constructor(private translate: TranslateService, private router: Router, private securityService: SecurityService, private lockService: LockServices) {
    translate.addLangs(['es']);
    translate.setDefaultLang('es');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match('es') ? browserLang : 'es');

    /*FOOTER COMPONENT*/
    router.events.subscribe((val) => {
      //console.log(val['url']);
      const rout = this.notView.find(find => find == val['url']);
      if (rout) {
        this.footerCompact = true;
      } else {
        this.footerCompact = false;
      }
    });

  }

  ngOnInit() {
    const home = new Menu(1, '', '/home', '', 'home menu bxi', this.menuType.navHome, null, null, null, 'home');

    const notifications = new Menu(5, '', '/', 'menu.notification', 'notification menu', this.menuType.navCategoryItem, null, null, null, '', 'notifications');
    const logout = new Menu(6, '', '', 'menu.logout', 'logout menu bxi', this.menuType.navDropdownItem, null, 10, null, '');
    const changePassword = new Menu(7, '', '', 'menu.change-password', 'change password menu bxi', this.menuType.navDropdownItem, null, 10, null, '', '#changePasswordModal');
    const systemAccess = new Menu(8, '', '/', 'menu.access-record', 'access record', this.menuType.navCategoryItem, null, null, null, '', 'recent_actors');
    const action = new Menu(9, '', '/', 'menu.actions', 'drop down menu bxi', this.menuType.navDropdown, [logout]);

    const user = new Menu(12, 'usuario', '/users', 'menu.user', 'user menu bxi', this.menuType.navCategoryItem, null, null, null, '', 'face');
    const profile = new Menu(11, 'perfil', '/profiles', 'menu.profile', 'profile menu bxi', this.menuType.navCategoryItem, null, null, null, '', 'account_circle');
    const role = new Menu(10, 'rol', '/roles', 'menu.role', 'role menu bxi', this.menuType.navCategoryItem, null, null, null, '', 'group');

    const generalParameter = new Menu(25, '', '/', 'menu.general-parameter', 'general parameter menu bxi', this.menuType.navCategoryItem, null, null, null, '', 'settings_applications');
    const referenceTypePerson = new Menu(23, '', '/', 'menu.reference-type-person', 'reference type person', this.menuType.navCategoryItem, null, null, null, '', 'location_city');
    const formProduct = new Menu(24, '', '/', 'menu.form-product', 'Form Product', this.menuType.navCategoryItem, null, null, null, '', 'location_city');

    const adminClient = new Menu(41, 'portalcliente', '/create', 'menu.portal-clients', 'admin clients menu backoffice', this.menuType.navCategoryItem, null, null, null, '', 'supervisor_account');
    const reprintForm = new Menu(42, '', '/', 'menu.reprint-form', 'Reprint Form', this.menuType.navCategoryItem, null, null, null, '', 'supervisor_account');

    const customerReferences = new Menu(50, 'referenciascliente', '/referenciasCliente', 'menu.referenciasCliente', 'referenciasCliente menu bxi', this.menuType.navCategoryItem, null, null, null, '', 'chrome_reader_mode');

    const security = new Menu(2, 'seguridad', '/', 'menu.security', 'security admin', this.menuType.navCategory, [role, profile, user], null, null, '', 'security');
    const settings = new Menu(3, 'parametrizacion', '/', 'menu.settings', 'settings admin', this.menuType.navCategory, [customerReferences], null, null, '', 'settings');
    // let operations = new Menu(4, '', '/', 'menu.operations', 'operations admin', this.menuType.navCategory, [adminClient, reprintForm], null, null, '', '', 'settings_applications');
    const operations = new Menu(4, 'operacion', '/', 'menu.operations', 'operations admin', this.menuType.navCategory, [adminClient], null, null, '', 'settings_applications');

    // const parametrizable = new Menu(49, 'parametrizable', '/', 'menu.customizable', 'security admin', this.menuType.navCategory, [referenciasCliente], null, null, '', 'build');
    // this.menus = [home, action, security, settings, operations];
    this.menus = [home, action, security, settings, operations];
    console.log(this.menus);
  }

  validateLogin(): boolean {
    return this.securityService.validateLogin();
  }

  @HostListener('window:unload', ['$event'])
  exitApp(event): void {
    this.lockService.deleteAllLock();
  }

  @HostListener('window:onunload', ['$event'])
  exitAppFirefox(event): void {
    this.lockService.deleteAllLock();
  }

  @HostListener('window:onbeforeunload', ['$event'])
  exitAppFirefoxBefore(event): void {
    this.lockService.deleteAllLock();
  }

  ngOnDestroy(): void {
    this.securityService.deleteCookie('identification');
    this.securityService.deleteCookie('client_signature');
    this.securityService.deleteCookie('client_mancomunado');
    this.securityService.deleteCookie('account_mancomunado');
    this.securityService.deleteCookie('account_signature');
    this.securityService.deleteCookie('accountNumber');
  }
}
