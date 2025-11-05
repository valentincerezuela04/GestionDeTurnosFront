import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardReserva } from './card-reserva';

describe('CardReserva', () => {
  let component: CardReserva;
  let fixture: ComponentFixture<CardReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardReserva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardReserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
