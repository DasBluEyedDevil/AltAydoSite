export interface UserProfile {
  name: string;
  handle: string;
  photo: string;
  subsidiary: string;
  payGrade: string;
  position: string;
  email: string;
  timezone: string;
  preferredGameplayLoops: string[];
}

// Predefined options for the dropdown fields
export const subsidiaryOptions = [
  'AydoCorp HQ',
  'Aydo Express',
  'Aydo Mining',
  'Aydo Salvage',
  'Aydo Security',
  'Aydo Research',
  'Aydo Medical',
  'Aydo Exploration',
];

export const payGradeOptions = [
  'Entry Level',
  'Junior',
  'Senior',
  'Lead',
  'Director',
  'Executive',
];

export const timezoneOptions = [
  'UTC-12:00',
  'UTC-11:00',
  'UTC-10:00',
  'UTC-09:00',
  'UTC-08:00',
  'UTC-07:00',
  'UTC-06:00',
  'UTC-05:00',
  'UTC-04:00',
  'UTC-03:00',
  'UTC-02:00',
  'UTC-01:00',
  'UTC+00:00',
  'UTC+01:00',
  'UTC+02:00',
  'UTC+03:00',
  'UTC+04:00',
  'UTC+05:00',
  'UTC+06:00',
  'UTC+07:00',
  'UTC+08:00',
  'UTC+09:00',
  'UTC+10:00',
  'UTC+11:00',
  'UTC+12:00',
];

export const gameplayLoopOptions = [
  'Mining',
  'Salvage',
  'Bounty Hunting',
  'Security',
  'Medical',
  'Trading',
  'Exploration',
  'Combat',
  'Transportation',
  'Escort',
  'Search & Rescue',
]; 