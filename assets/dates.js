/* Date-only arithmetic uses UTC day numbers to avoid timezone and DST drift. */
(function (root) {
  'use strict';
  const DAY = 86400000;
  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) throw new Error('Enter a valid date of birth.');
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, month - 1, day);
    if (year < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error('Enter a valid date of birth.');
    return date;
  }
  function localToday(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  }
  function calculate(birthValue, todayValue = localToday()) {
    const birth = parseDate(birthValue), today = parseDate(todayValue);
    if (birth > today) throw new Error('The date of birth must be today or earlier.');
    const milestone = new Date(birth);
    // Feb 29 birthdays use Feb 28 in a non-leap milestone year.
    milestone.setUTCDate(1);
    milestone.setUTCFullYear(birth.getUTCFullYear() + 18);
    const monthEnd = new Date(milestone);
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1, 0);
    const lastDay = monthEnd.getUTCDate();
    milestone.setUTCDate(Math.min(birth.getUTCDate(), lastDay));
    const totalDays = Math.round((milestone - birth) / DAY);
    const daysLeft = Math.max(0, Math.round((milestone - today) / DAY));
    const passedDays = Math.max(0, Math.min(totalDays, Math.round((today - birth) / DAY)));
    const firstSaturday = (6 - today.getUTCDay() + 7) % 7;
    const saturdays = daysLeft > firstSaturday ? 1 + Math.floor((daysLeft - firstSaturday - 1) / 7) : 0;
    return {daysLeft, weeksLeft: Math.ceil(daysLeft / 7), saturdays,
      totalWeeks: Math.ceil(totalDays / 7), passedWeeks: Math.floor(passedDays / 7),
      isAdult: today >= milestone, milestone: milestone.toISOString().slice(0,10)};
  }
  const api = {calculate, localToday};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ANCHRDates = api;
})(typeof window !== 'undefined' ? window : this);
