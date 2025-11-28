import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialCliente } from './historial-cliente';

describe('HistorialCliente', () => {
  let component: HistorialCliente;
  let fixture: ComponentFixture<HistorialCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
