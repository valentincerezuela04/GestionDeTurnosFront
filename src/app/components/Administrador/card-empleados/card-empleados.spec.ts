import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEmpleados } from './card-empleados';

describe('CardEmpleados', () => {
  let component: CardEmpleados;
  let fixture: ComponentFixture<CardEmpleados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEmpleados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEmpleados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
