import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDocumentsInformationComponent } from './student-documents-information.component';

describe('StudentDocumentsInformationComponent', () => {
  let component: StudentDocumentsInformationComponent;
  let fixture: ComponentFixture<StudentDocumentsInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentDocumentsInformationComponent]
    });
    fixture = TestBed.createComponent(StudentDocumentsInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
