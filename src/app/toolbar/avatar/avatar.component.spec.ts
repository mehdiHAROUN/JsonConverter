import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAvatarComponent } from './avatar.component';

describe('AppAvatarComponent', () => {
  let component: AppAvatarComponent;
  let fixture: ComponentFixture<AppAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAvatarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
