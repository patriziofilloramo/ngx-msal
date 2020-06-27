import { TestBed } from '@angular/core/testing';

import { NgxMsalLibService } from './ngx-msal-lib.service';

describe('NgxMsalLibService', () => {
  let service: NgxMsalLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMsalLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
