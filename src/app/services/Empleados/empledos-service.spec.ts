import { TestBed } from '@angular/core/testing';

import { EmpledosService } from './empledos-service';

describe('EmpledosService', () => {
  let service: EmpledosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpledosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
