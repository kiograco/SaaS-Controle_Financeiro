import { Injectable } from '@angular/core';
import { TimeEntry } from '../models/time-tracking.models';
import { GenericCompanyResourceService } from './generic-company-resource.service';

@Injectable({ providedIn: 'root' })
export class TimeEntryService extends GenericCompanyResourceService<TimeEntry> {
  constructor() {
    super('time/entries');
  }
}
