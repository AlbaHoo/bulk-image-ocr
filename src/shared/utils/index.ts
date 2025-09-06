import moment from 'moment';

export function parseToDate(value: any, format?: string): Date {
  const m = moment(value, format);
  return m.isValid() ? m.toDate() : null;
}

export function formatToDateStr(value: any) {
  return moment(value).format('YYYY-MM-DD');
}

export function formatToDateTimeStr(value: any) {
  return moment(value).format('DD/MM/YYYY HH:mm:ss');
}

export function getCurrentHoursInTimezone(timeZone: string) {
  const date = new Date();
  const localeString = date.toLocaleString('en-US', {
    timeZone,
    hour: '2-digit',
    hour12: false, // Use true for 12-hour format if desired
  });
  return Number(localeString);
}

export function pluralise(count: number, singular: string, plural?: string) {
  return count > 1 ? `${count} ${plural || `${singular}s`}` : `${count} ${singular}`;
}

export function removeLeadingZeros(str: string) {
  return str ? str.replace(/^0+(?!$)/, '') : '';
}
