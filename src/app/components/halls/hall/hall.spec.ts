import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hall } from './hall';

describe('Hall', () => {
  let component: Hall;
  let fixture: ComponentFixture<Hall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hall);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
