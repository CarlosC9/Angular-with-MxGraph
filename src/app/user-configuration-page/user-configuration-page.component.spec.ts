import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConfigurationPageComponent } from './user-configuration-page.component';

describe('UserConfigurationPageComponent', () => {
  let component: UserConfigurationPageComponent;
  let fixture: ComponentFixture<UserConfigurationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserConfigurationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserConfigurationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
