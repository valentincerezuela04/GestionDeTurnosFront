import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoFormPost } from './empleado-form-post';

describe('EmpleadoFormPost', () => {
  let component: EmpleadoFormPost;
  let fixture: ComponentFixture<EmpleadoFormPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadoFormPost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpleadoFormPost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
