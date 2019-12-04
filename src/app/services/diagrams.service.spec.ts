import { TestBed } from '@angular/core/testing';

import { DiagramsService } from './diagrams.service';

describe('DiagramsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DiagramsService = TestBed.get(DiagramsService);
    expect(service).toBeTruthy();
  });
});
