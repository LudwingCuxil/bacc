import {
  Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import {Role} from './shared/role';
import {NotificationsService} from 'angular2-notifications';
import {RoleService} from './shared/role.service';

@Component({
  selector: 'pl-role-dual-list',
  template: `
    <dual-list [sort]="sort" [source]="roles" [key]="identifier" [display]="display" [(destination)]="added"
               (onAdded)="onAdded($event)" (onRemoved)="onRemoved($event)" height="265px"></dual-list>`,
  styles: [],
  providers: [RoleService]
})
export class RoleDualListComponent implements OnInit, AfterViewChecked {

  @Input() sort: true;
  @Input() roles: Role[] = [];
  @Input() identifier = 'id';
  @Input() display = 'descripcion';
  @Input() added: Role[] = [];
  @Input() asigned: number[] = null;
  @Output() onRemove: EventEmitter<Role[]> = new EventEmitter<Role[]>();
  @Output() onAdd: EventEmitter<Role[]> = new EventEmitter<Role[]>();

  constructor(private notificationService: NotificationsService, private roleService: RoleService,
              private _changeDetectorRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.loadAll();
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  loadAll(): void {
    if (this.roles.length === 0) {
      this.roleService.getRoles({number: 0, size: 1500})
        .then((roles: any) => this.fetchRoles(roles.content), (e: any) => this.handleError(e));
    } else {
      this.fillAsigned(this.roles);
    }
  }

  fetchRoles(roles: Role[]) {
    this.roles = roles;
    this.fillAsigned(roles);
  }

  fillAsigned(roles?: Role[]) {
    if (this.asigned != null) {
      for (let i = 0; i < this.asigned.length; i++) {
        for (const role of roles) {
          // FIXME: Refactorizar
          const currentAdded = this.added.find(item => item.id === role.id);

          if (role.id === this.asigned[i] && !currentAdded) {
            this.added.push(role);
            break;
          }
        }
      }
      this._changeDetectorRef.detectChanges();
    }

  }

  onAdded(added: any) {
    this.onAdd.emit(added);
    this._changeDetectorRef.detectChanges();
  }

  onRemoved(removed: any) {
    this.onRemove.emit(removed);
    this._changeDetectorRef.detectChanges();
  }

  handleError(error: any): void {
    if (error._body !== '') {
      this.notificationService.error('An error occurred, status: ' + error.status, JSON.parse(error._body).message);
    } else if (error.status === 404) {
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.notificationService.error('Internal Error', 'The server response 500 error');
    }
  }

}
