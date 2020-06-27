import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMsalLibComponent } from './ngx-msal-lib.component';

describe('NgxMsalLibComponent', () => {
  let component: NgxMsalLibComponent;
  let fixture: ComponentFixture<NgxMsalLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxMsalLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMsalLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
