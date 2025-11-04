import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadForm } from './load-form';

describe('LoadForm', () => {
  let component: LoadForm;
  let fixture: ComponentFixture<LoadForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
