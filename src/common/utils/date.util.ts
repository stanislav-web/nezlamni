import addHours from 'date-fns/addHours';
import getUnixTime from 'date-fns/getUnixTime';

/**
 * Add hours to current date
 * @param {number} hours
 */
export const addHoursToCurrentDate = (hours: number): Date =>
  addHours(new Date(), hours);

/**
 * Add hours to current date
 * @param {Date} date
 */
export const toUnixTimestamp = (date: Date = new Date()): number =>
  getUnixTime(date);
