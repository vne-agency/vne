import * as migration_20260805_120011_initial_schema from './20260805_120011_initial_schema';
import * as migration_20260908_030000_case_details from './20260908_030000_case_details';
import * as migration_20260912_170000_lead_consent from './20260912_170000_lead_consent';

export const migrations = [
  {
    up: migration_20260805_120011_initial_schema.up,
    down: migration_20260805_120011_initial_schema.down,
    name: '20260805_120011_initial_schema'
  },
  {
    up: migration_20260908_030000_case_details.up,
    down: migration_20260908_030000_case_details.down,
    name: '20260908_030000_case_details'
  },
  {
    up: migration_20260912_170000_lead_consent.up,
    down: migration_20260912_170000_lead_consent.down,
    name: '20260912_170000_lead_consent'
  },
];
