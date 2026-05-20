import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { MissionAdd } from './mission-add';

describe('MissionAdd', () => {
  let component: MissionAdd;
  let fixture: ComponentFixture<MissionAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionAdd],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MissionAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
