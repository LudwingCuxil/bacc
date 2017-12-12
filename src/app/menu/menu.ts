import {MenuType} from './menu-type.enum';
export class Menu {
  id: number;
  name: string;
  path: string;
  title: string;
  description: string;
  type: MenuType;
  order: number;
  subMenus: Menu[];
  action: Function;
  modalTarget: string;
  iconClass: string;

  constructor(id: number, name: string, path: string, title: string, description: string, type: MenuType, subMenus?: Menu[], order?: number, action?: Function, modalTarget?: string, iconClass?: string) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.title = title;
    this.description = description;
    this.type = type;
    this.subMenus = subMenus;
    this.order = order;
    this.action = action;
    this.modalTarget = modalTarget;
    this.iconClass = iconClass;
  }
}
