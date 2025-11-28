import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialGeneral } from './historial-general';

describe('HistorialGeneral', () => {
  let component: HistorialGeneral;
  let fixture: ComponentFixture<HistorialGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialGeneral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialGeneral);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
