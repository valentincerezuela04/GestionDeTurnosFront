import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisEmpleados } from './mis-empleados';

describe('MisEmpleados', () => {
  let component: MisEmpleados;
  let fixture: ComponentFixture<MisEmpleados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisEmpleados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisEmpleados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
