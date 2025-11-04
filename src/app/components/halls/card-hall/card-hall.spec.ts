import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardHall } from './card-hall';

describe('CardHall', () => {
  let component: CardHall;
  let fixture: ComponentFixture<CardHall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardHall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardHall);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
