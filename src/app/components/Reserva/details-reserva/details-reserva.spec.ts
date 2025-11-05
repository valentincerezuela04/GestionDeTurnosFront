import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsReserva } from './details-reserva';

describe('DetailsReserva', () => {
  let component: DetailsReserva;
  let fixture: ComponentFixture<DetailsReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsReserva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsReserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
