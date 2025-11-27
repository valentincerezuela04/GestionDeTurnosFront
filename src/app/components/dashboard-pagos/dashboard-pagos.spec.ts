import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPagos } from './dashboard-pagos';

describe('DashboardPagos', () => {
  let component: DashboardPagos;
  let fixture: ComponentFixture<DashboardPagos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPagos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPagos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
