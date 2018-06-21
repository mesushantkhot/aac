import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaheadAddressComponent } from './typeahead-address.component';

describe('TypeaheadAddressComponent', () => {
  let component: TypeaheadAddressComponent;
  let fixture: ComponentFixture<TypeaheadAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeaheadAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeaheadAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
