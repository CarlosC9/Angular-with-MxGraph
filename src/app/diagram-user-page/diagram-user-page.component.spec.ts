import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramUserPageComponent } from './diagram-user-page.component';

describe('DiagramUserPageComponent', () => {
  let component: DiagramUserPageComponent;
  let fixture: ComponentFixture<DiagramUserPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagramUserPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramUserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
