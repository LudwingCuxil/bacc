import {Navigation} from './navigation';
/**
 * Created by elioth010 on 6/2/17.
 */
export class WebForm {
  data: any;
  navigation: { available: Navigation[], current: Navigation[] };
  extraData: any;

  constructor(data: any, navigation: { available: Navigation[]; current: Navigation[] }, extraData?: any) {
    this.data = data;
    this.navigation = navigation;
    this.extraData = extraData;
  }
}
