import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Autobuses } from './autobuses';

describe('Autobuses', () => {
  let component: Autobuses;
  let fixture: ComponentFixture<Autobuses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Autobuses],
    }).compileComponents();

    fixture = TestBed.createComponent(Autobuses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
