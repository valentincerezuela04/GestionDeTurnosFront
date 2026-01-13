import { TestBed } from '@angular/core/testing';

import { UiAlert } from './ui-alert';

describe('UiAlert', () => {
  let service: UiAlert;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiAlert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
