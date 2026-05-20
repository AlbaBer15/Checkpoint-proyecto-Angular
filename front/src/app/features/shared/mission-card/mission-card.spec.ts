import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MissionCard } from './mission-card';

describe('MissionCard', () => {
  let component: MissionCard;
  let fixture: ComponentFixture<MissionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionCard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MissionCard);
    component = fixture.componentInstance;
    component.mision = {
      id: 1,
      titulo: 'Misión de prueba',
      descripcion: 'Descripción de prueba',
      xp: 10,
      estado: 'pendiente',
      favorito: false,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
