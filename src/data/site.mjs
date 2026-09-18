// Update this date when publishing editorial changes, not on every build.
export const lastUpdated = '2026-09-17';
export const lastUpdatedLabel = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${lastUpdated}T00:00:00Z`));
