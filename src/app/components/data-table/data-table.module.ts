import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {DataTableByteComponent} from './data-table.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap-byte';
import {TranslateModule, TranslateService} from 'ng2-translate';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    TranslateModule,
  ],
  declarations: [
    DataTableByteComponent,
  ],
  exports: [
    DataTableByteComponent
  ]
})
export class DataTableByteModule {}
