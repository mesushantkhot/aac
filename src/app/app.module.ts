import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TypeaheadAddressComponent } from './typeahead-address/typeahead-address.component';
import { AutoCompleteSearchService } from './typeahead-address/auto-complete.service';
import { BrowserGlobalRef, GlobalRef } from './typeahead-address/windowRef.service';
import { LocalStorageService } from './typeahead-address/storage.service';

@NgModule({
  declarations: [
    AppComponent,
    TypeaheadAddressComponent
  ],
  imports: [
    BrowserModule, 
    HttpModule,
    FormsModule
  ],
  providers: [AutoCompleteSearchService, LocalStorageService, { provide: GlobalRef, useClass: BrowserGlobalRef }],
  bootstrap: [AppComponent]
})
export class AppModule { }
