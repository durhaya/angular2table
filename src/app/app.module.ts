import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NgTableComponent } from './ng-table/ng-table.component';
import { OrderByPipe } from './pipes/order-by.pipe';
import { ModalPopupComponent } from './modal-popup/modal-popup.component';
import { IonRangeSliderModule } from "ng2-ion-range-slider";
import { RoundProgressModule } from 'angular-svg-round-progressbar';

@NgModule({
  declarations: [
    AppComponent,
    NgTableComponent,
    OrderByPipe,
    ModalPopupComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    IonRangeSliderModule,
    RoundProgressModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
