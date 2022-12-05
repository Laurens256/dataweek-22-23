import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizingComponent } from './authorizing.component';

describe('AuthorizingComponent', () => {
  let component: AuthorizingComponent;
  let fixture: ComponentFixture<AuthorizingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorizingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorizingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
