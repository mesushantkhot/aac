import { Component, PLATFORM_ID, Inject, Input, Output, EventEmitter, OnInit, OnChanges, ElementRef } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { GlobalRef } from './windowRef.service';
import { AutoCompleteSearchService } from './auto-complete.service';
import { FormBuilder, FormGroup } from '@angular/forms';


export interface Settings {
  geoPredictionServerUrl?: string;
  geoLatLangServiceUrl?: string;
  geoLocDetailServerUrl?: string;
  geoCountryRestriction?: any;
  geoTypes?: any;
  geoLocation?: any;
  geoRadius?: number;
  serverResponseListHierarchy?: any;
  serverResponseatLangHierarchy?: any;
  serverResponseDetailHierarchy?: any;
  resOnSearchButtonClickOnly?: boolean;
  useGoogleGeoApi?: boolean;
  inputPlaceholderText?: string;
  inputString?: string;
  showSearchButton?: boolean;
  showRecentSearch?: boolean;
  showCurrentLocation?: boolean;
  recentStorageName?: string;
  noOfRecentSearchSave?: number;
  currentLocIconUrl?: string;
  searchIconUrl?: string;
  locationIconUrl?: string;
}

@Component({
  selector: 'app-typeahead-address',
  templateUrl: './typeahead-address.component.html',
  styleUrls: ['./typeahead-address.component.css'], 
  host: {
    '(document:click)': 'closeAutocomplete($event)',
  }
})
export class TypeaheadAddressComponent implements OnInit {
  public fullAddress:string;
  public locationInput: string = '';
  public gettingCurrentLocationFlag: boolean = false;
  public dropdownOpen: boolean = false;
  public recentDropdownOpen: boolean  = false;
  public queryItems: any = [];
  public isSettingsError: boolean = false;
  public settingsErrorMsg: string = '';
  public settings: Settings = {};
  private moduleinit: boolean = false;
  private selectedDataIndex: number = -1;
  private recentSearchData: any = [];
  private userSelectedOption: any = '';
  public googleForm: FormGroup;
  private defaultSettings: Settings = {
    geoPredictionServerUrl: '',
    geoLatLangServiceUrl: '',
    geoLocDetailServerUrl: '',
    geoCountryRestriction: [],
    geoTypes: [],
    geoLocation: [],
    geoRadius: 0,
    serverResponseListHierarchy: [],
    serverResponseatLangHierarchy: [],
    serverResponseDetailHierarchy: [],
    resOnSearchButtonClickOnly: false,
    useGoogleGeoApi: true,
    inputPlaceholderText: 'Enter Area Name',
    inputString: '',
    showSearchButton: true,
    showRecentSearch: true,
    showCurrentLocation: true,
    recentStorageName: 'recentSearches',
    noOfRecentSearchSave: 5,
    currentLocIconUrl: '',
    searchIconUrl: '',
    locationIconUrl: ''
  };
  @Input() userSettings: Settings;

  @Output()
  componentCallback: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
  private _elmRef: ElementRef,
  private _autoCompleteSearchService: AutoCompleteSearchService,
  private fb: FormBuilder) { }

  ngOnInit() {
    if (!this.moduleinit) {
      this.moduleInit();
    }
    this.googleForm = this.fb.group({
      streetNumber: '', 
      streetName:'',
      state:'',
      city:'',
      country:'',
      zipCode:''
    });
  }

  
  //function called when click event happens in input box. (Binded with view)
  searchinputClickCallback(event: any): any {
    event.target.select();
    this.searchinputCallback(event);
  }

  //function called when there is a change in input. (Binded with view)
  searchinputCallback(event: any): any {
    let inputVal: any = this.locationInput;
    if ((event.keyCode === 40) || (event.keyCode === 38) || (event.keyCode === 13)) {
      this.navigateInList(event.keyCode);
    } else if (inputVal) {
      this.getListQuery(inputVal);
    } else {
      this.dropdownOpen = false;
    }
  }

    //function to execute when user select the autocomplete list.(binded with view)
  selectedListNode(index: number): any {
    this.dropdownOpen = false;
    this.getPlaceLocationInfo(this.queryItems[index]);
  }

    //function to manually trigger the callback to parent component when clicked search button.
  userQuerySubmit(selectedOption?: any): any {
    let _userOption: any = selectedOption === 'false' ? '' : this.userSelectedOption;
    if (_userOption) {
      this.componentCallback.emit({'response': true, 'data': this.userSelectedOption});
    }else {
      this.componentCallback.emit({'response': false, 'reason': 'No user input'});
    }
  }

  //module initialization happens. function called by ngOninit and ngOnChange
  private moduleInit(): any {
    this.settings = this.setUserSettings();
    this.locationInput = this.settings.inputString;
  }

  //function to process the search query when pressed enter.
  private processSearchQuery(): any {
    if (this.queryItems.length) {
      if (this.selectedDataIndex > -1) {
        this.selectedListNode(this.selectedDataIndex);
      }else {
        this.selectedListNode(0);
      }
    }
  }

  //function to set user settings if it is available.
  private setUserSettings(): Settings {
    let _tempObj: any = {};
    if (this.userSettings && typeof(this.userSettings) === 'object') {
      let keys: string[] = Object.keys(this.defaultSettings);
      for (let value of keys) {
        _tempObj[value] = (this.userSettings[value] !== undefined) ? this.userSettings[value] : this.defaultSettings[value];
      }
      return _tempObj;
    }else {
      return this.defaultSettings;
    }
  }

  //function to get the autocomplete list based on user input.
  private getListQuery(value: string): any {
    this.recentDropdownOpen = false;
    if (this.settings.useGoogleGeoApi) {
      let _tempParams: any = {
        'query': value,
        'countryRestriction': this.settings.geoCountryRestriction,
        'geoTypes': this.settings.geoTypes
      };
      if (this.settings.geoLocation.length === 2) {
        _tempParams.geoLocation = this.settings.geoLocation;
        _tempParams.radius = this.settings.geoRadius;
      }
      this._autoCompleteSearchService.getGeoPrediction(_tempParams).then((result) => {
        this.updateListItem(result);
      });
    }
  }

  //function to extratc custom data which is send by the server.
  private extractServerList(arrayList: any, data: any): any {
    if (arrayList.length) {
      let _tempData: any = data;
      for (let key of arrayList) {
        _tempData = _tempData[key];
      }
      return _tempData;
    }else {
      return data;
    }
  }

  //function to update the predicted list.
  private updateListItem(listData: any): any {
    this.queryItems = listData ? listData : [];
    this.dropdownOpen = true;
  }

  // //function to show the recent search result.
  // private showRecentSearch(): any {
  //   this.recentDropdownOpen = true;
  //   this.dropdownOpen = true;
  //   this._autoCompleteSearchService.getRecentList(this.settings.recentStorageName).then((result: any) => {
  //     if (result) {
  //       this.queryItems = result;
  //     }else {
  //       this.queryItems = [];
  //     }
  //   });
  // }

  //function to navigate through list when up and down keyboard key is pressed;
  private navigateInList(keyCode: number): any {
    let arrayIndex: number = 0;
    //arrow down
    if (keyCode === 40) {
      if (this.selectedDataIndex >= 0) {
        arrayIndex = ((this.selectedDataIndex + 1) <= (this.queryItems.length - 1)) ? (this.selectedDataIndex + 1) : 0;
      }
      this.activeListNode(arrayIndex);
    }else if (keyCode === 38) {//arrow up
      if (this.selectedDataIndex >= 0) {
        arrayIndex = ((this.selectedDataIndex - 1) >= 0) ? (this.selectedDataIndex - 1) : (this.queryItems.length - 1);
      }else {
        arrayIndex = this.queryItems.length - 1;
      }
      this.activeListNode(arrayIndex);
    } else {
      this.processSearchQuery();
    }
  }

    //function to execute when user hover over autocomplete list.(binded with view)
    activeListNode(index: number): any {
      for (let i: number = 0; i < this.queryItems.length; i++) {
        if (index === i) {
          this.queryItems[i].active = true;
          this.selectedDataIndex = index;
        }else {
          this.queryItems[i].active = false;
        }
      }
    }
  

  // //function to execute to get location detail based on latitude and longitude.
  // private getCurrentLocationInfo(latlng: any): any {
  //   if (this.settings.useGoogleGeoApi) {
  //     this._autoCompleteSearchService.getGeoLatLngDetail(latlng).then((result: any) => {
  //       if (result) {
  //        this.setRecentLocation(result);
  //       }
  //       this.gettingCurrentLocationFlag = false;
  //     });
  //   }else {
  //     this._autoCompleteSearchService.getLatLngDetail(this.settings.geoLatLangServiceUrl, latlng.lat, latlng.lng).then((result: any) => {
  //       if (result) {
  //         result = this.extractServerList(this.settings.serverResponseatLangHierarchy, result);
  //         this.setRecentLocation(result);
  //       }
  //       this.gettingCurrentLocationFlag = false;
  //     });
  //   }
  // }

  //function to retrive the location info based on goovle place id.
  private getPlaceLocationInfo(selectedData: any): any {
    if (this.settings.useGoogleGeoApi) {
      this._autoCompleteSearchService.getGeoPlaceDetail(selectedData.place_id).then((data: any) => {
        this.fullAddress = data.formatted_address;
        let address = {};
           if(data && data.address_components && data.address_components.length > 0) {
            data.address_components.forEach(addr => {
              if(addr && addr.types && addr.types[0]){

                switch(addr.types[0]){
                  case "street_number":address['streetNumber'] = addr['long_name'];
                                      break;
                  case "route":address['streetName'] = addr['long_name'];
                                      break;
                  case "neighborhood":address['neighborhoodname'] = addr['long_name'];
                                      break;
                  case "locality":address['city'] = addr['long_name'];
                                      break;
                  case "administrative_area_level_2":address['adminArea'] = addr['long_name'];
                                      break;
                  case "administrative_area_level_1":address['state'] = addr['short_name'];
                                      break;
                  case "country":address['country'] = addr['long_name'];
                                      break;
                  case "postal_code":address['zipcode'] = addr['long_name'];
                                      break;
                }
              }
            });
           }
           this.googleForm.get('streetName').setValue(address['streetName']);
           this.googleForm.get('streetNumber').setValue(address['streetNumber']);
           this.googleForm.get('city').setValue(address['city']);
           this.googleForm.get('state').setValue(address['state']);
           this.googleForm.get('country').setValue(address['country']);
           this.googleForm.get('zipCode').setValue(address['zipcode']);
           console.log(this.googleForm.value);


            
           
      });
    }
  }

    //function to close the autocomplete list when clicked outside. (binded with view)
  closeAutocomplete(event: any): any {
    if (!this._elmRef.nativeElement.contains(event.target)) {
      this.selectedDataIndex = -1;
      this.dropdownOpen = false;
    }
  }

  // //function to store the selected user search in the localstorage.
  // private setRecentLocation(data: any): any {
  //   data = JSON.parse(JSON.stringify(data));
  //   data.description = data.description ? data.description : data.formatted_address;
  //   data.active = false;
  //   this.selectedDataIndex = -1;
  //   this.locationInput = data.description;
  //   if (this.settings.showRecentSearch) {
  //     this._autoCompleteSearchService.addRecentList(this.settings.recentStorageName, data, this.settings.noOfRecentSearchSave);
  //     this.getRecentLocations();
  //   }
  //   this.userSelectedOption = data;
  //   //below code will execute only when user press enter or select any option selection and it emit a callback to the parent component.
  //   if (!this.settings.resOnSearchButtonClickOnly) {
  //     this.componentCallback.emit({'response': true, 'data': data});
  //   }
  // }

  //function to retrive the stored recent user search from the localstorage.
  // private getRecentLocations(): any {
  //   this._autoCompleteSearchService.getRecentList(this.settings.recentStorageName).then((data: any) => {
  //     this.recentSearchData = (data && data.length) ? data : [];
  //   });
  // }
}


// import { Component, PLATFORM_ID, Inject, Input, Output, EventEmitter, OnInit, OnChanges, ElementRef } from '@angular/core';
// import { isPlatformBrowser, isPlatformServer } from '@angular/common';
// import { GlobalRef } from './windowRef.service';
// import { AutoCompleteSearchService } from './auto-complete.service';


// export class AutoCompleteComponent implements OnInit, OnChanges {
// 	@Input() userSettings: Settings;
//   @Output()
//   componentCallback: EventEmitter<any> = new EventEmitter<any>();

  
//   constructor(@Inject(PLATFORM_ID) private platformId: Object,
//   private _elmRef: ElementRef, private _global: GlobalRef,
//   private _autoCompleteSearchService: AutoCompleteSearchService) {

//   }

//   ngOnInit(): any {
//     if (!this.moduleinit) {
//       this.moduleInit();
//     }
//   }

//   ngOnChanges(): any {
//     this.moduleinit = true;
//     this.moduleInit();
//   }



//   //function to execute when user hover over autocomplete list.(binded with view)
//   activeListNode(index: number): any {
//     for (let i: number = 0; i < this.queryItems.length; i++) {
//       if (index === i) {
//         this.queryItems[i].active = true;
//         this.selectedDataIndex = index;
//       }else {
//         this.queryItems[i].active = false;
//       }
//     }
//   }





//   //function to get user current location from the device.
//   currentLocationSelected(): any {
//     if (isPlatformBrowser(this.platformId)) {
//       this.gettingCurrentLocationFlag = true;
//       this.dropdownOpen = false;
//       this._autoCompleteSearchService.getGeoCurrentLocation().then((result: any) => {
//         if (!result) {
//           this.gettingCurrentLocationFlag = false;
//           this.componentCallback.emit({'response': false, 'reason': 'Failed to get geo location'});
//         }else {
//           this.getCurrentLocationInfo(result);
//         }
//       });
//     }
//   }

// }
