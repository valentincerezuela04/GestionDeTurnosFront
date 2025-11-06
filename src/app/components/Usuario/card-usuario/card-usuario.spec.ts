import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardUsuario } from './card-usuario';

describe('CardUsuario', () => {
  let component: CardUsuario;
  let fixture: ComponentFixture<CardUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
