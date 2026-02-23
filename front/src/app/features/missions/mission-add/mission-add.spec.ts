import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionAdd } from './mission-add';

describe('MissionAdd', () => {
  let component: MissionAdd;
  let fixture: ComponentFixture<MissionAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
