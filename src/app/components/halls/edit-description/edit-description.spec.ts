import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDescription } from './edit-description';

describe('EditDescription', () => {
  let component: EditDescription;
  let fixture: ComponentFixture<EditDescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDescription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDescription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
