import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHubComponent } from './document-hub.component';

describe('DocumentHubComponent', () => {
  let component: DocumentHubComponent;
  let fixture: ComponentFixture<DocumentHubComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentHubComponent]
    });
    fixture = TestBed.createComponent(DocumentHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
