import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaForm } from './reserva-form';

describe('ReservaForm', () => {
  let component: ReservaForm;
  let fixture: ComponentFixture<ReservaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
