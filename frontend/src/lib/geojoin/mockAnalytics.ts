import type { ConstituencyAnalyticsRecord } from './types';

export const mockConstituencyAnalytics: ConstituencyAnalyticsRecord[] = [
  {
    constituency_id: 'IN-AP-001',
    winning_party: 'BJP',
    turnout_percentage: 72.1,
    population: 1762400,
  },
  {
    constituency_id: 'IN-AP-002',
    winning_party: 'INC',
    turnout_percentage: 68.4,
    population: 1598300,
  },
  {
    constituency_id: 'IN-BR-013',
    winning_party: 'RJD',
    turnout_percentage: 61.7,
    population: 2350000,
  },
  {
    constituency_id: 'IN-TN-034',
    winning_party: 'DMK',
    turnout_percentage: 74.9,
    population: 1895200,
  },
  {
    constituency_id: 'IN-UP-056',
    winning_party: 'BSP',
    turnout_percentage: 63.0,
    population: 2011200,
  },
];

export const defaultAnalyticsKeyField = 'constituency_id';
