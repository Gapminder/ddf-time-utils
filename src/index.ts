import uniq = require('lodash/uniq');
import head = require('lodash/head');
import isString = require('lodash/isString');
import isArray = require('lodash/isArray');
import compact = require('lodash/compact');
import flatten = require('lodash/flatten');
import concat = require('lodash/concat');
import range = require('lodash/range');
import { utc } from 'moment';

const TWO_DIGITS_MIN_NUMBER = 10;
const MAX_MONTH = 12;
const MAX_DAY = 31;
const FIRST_MATCH = 1;
const SECOND_MATCH = 2;
const THIRD_MATCH = 3;
const THIRD_ELEMENT = 2;

export const YEAR_TYPE = Symbol.for('YEAR_TYPE');
export const QUARTER_TYPE = Symbol.for('QUARTER_TYPE');
export const MONTH_TYPE = Symbol.for('MONTH_TYPE');
export const WEEK_TYPE = Symbol.for('WEEK_TYPE');
export const DATE_TYPE = Symbol.for('DATE_TYPE');

const YEAR_PATTERN = /^(\d{3,4})$/;
const QUARTER_PATTERN = /^(\d{3,4})q(\d{1})$/;
const MONTH_PATTERN = /^(\d{3,4})(\d{2})$/;
const WEEK_PATTERN = /^(\d{3,4})w(\d{1,2})$/;
const DATE_PATTERN = /^(\d{3,4})(\d{2})(\d{2})$/;

const TIME_TYPE_PATTERNS = {
  [YEAR_TYPE]: {
    regularExp: YEAR_PATTERN,
    patternDate: 'YYYY',
    formatDate: 'YYYY'
  },
  [QUARTER_TYPE]: {
    regularExp: QUARTER_PATTERN,
    patternDate: 'YYYY Q',
    formatDate: 'YYYY[q]Q'
  },
  [MONTH_TYPE]: {
    regularExp: MONTH_PATTERN,
    patternDate: 'YYYYMM',
    formatDate: 'YYYYMM'
  },
  [WEEK_TYPE]: {
    regularExp: WEEK_PATTERN,
    patternDate: 'YYYY W',
    formatDate: 'YYYY[w]W'
  },
  [DATE_TYPE]: {
    regularExp: DATE_PATTERN,
    patternDate: 'YYYYMMDD',
    formatDate: 'YYYYMMDD'
  }
};

export const TIME_TYPES = Object.getOwnPropertySymbols(TIME_TYPE_PATTERNS);
export const TIME_TYPES_AS_STRINGS = TIME_TYPES.map(Symbol.keyFor);
export const TIME_TYPES_DDF_COMPATIBLE = concat(
  'time',
  TIME_TYPES_AS_STRINGS.map(key => key.replace(/_TYPE/, '').toLowerCase())
);

function extractLocalTimeRange(type) {
  function parse(option) {
    const matchStart = TIME_TYPE_PATTERNS[type].regularExp.exec(option[0]);
    const matchEnd = TIME_TYPE_PATTERNS[type].regularExp.exec(option[1]);

    return {
      start: [matchStart[FIRST_MATCH], matchStart[SECOND_MATCH], matchStart[THIRD_MATCH]],
      end: [matchEnd[FIRST_MATCH], matchEnd[SECOND_MATCH], matchEnd[THIRD_MATCH]]
    };
  }

  function getTypicalRange(option, settings) {
    const parsed = parse(option);
    const startYear = Number(parsed.start[0]);
    const startSecondMatch = Number(parsed.start[1]);
    const endYear = Number(parsed.end[0]);
    const endSecondMatch = Number(parsed.end[1]);
    const result = [];

    function isZeroAppendNeeded(value) {
      return settings.isAppendZero && value < TWO_DIGITS_MIN_NUMBER;
    }

    range(startYear, endYear + 1).forEach(year => {
      const startValue = year === startYear ? startSecondMatch : settings.minLimit;
      const endValue = year === endYear ? endSecondMatch : settings.maxLimit;

      range(startValue, endValue + 1).forEach(valueParam => {
        const value = isZeroAppendNeeded(valueParam) ? `0${valueParam}` : valueParam;

        result.push(year + settings.divider + value);
      });
    });

    return result;
  }

  const OPTIONS = {
    [YEAR_TYPE]: option => {
      const parsed = parse(option);
      const sYear = Number(parsed.start[0]);
      const fYear = Number(parsed.end[0]);

      return range(sYear, fYear + 1)
        .map(year => `${year}`);
    },
    [QUARTER_TYPE]: option => getTypicalRange(option, {minLimit: 1, maxLimit: 4, divider: 'q', isAppendZero: false}),
    [MONTH_TYPE]: option => getTypicalRange(option, {minLimit: 1, maxLimit: 12, divider: '', isAppendZero: true}),
    [WEEK_TYPE]: option => getTypicalRange(option, {minLimit: 1, maxLimit: 53, divider: 'w', isAppendZero: true}),
    [DATE_TYPE]: option => {
      const result = [];
      const parsed = parse(option);
      const startYear = Number(parsed.start[0]);
      const endYear = Number(parsed.end[0]);
      const startMonth = Number(parsed.start[1]);
      const endMonth = Number(parsed.end[1]);
      const startDay = Number(parsed.start[THIRD_ELEMENT]);
      const endDay = Number(parsed.end[THIRD_ELEMENT]);

      range(startYear, endYear + 1).forEach(year => {
        const currentStartMonth = year === startYear ? startMonth : 1;
        const currentEndMonth = year === endYear ? endMonth : MAX_MONTH;

        range(currentStartMonth, currentEndMonth + 1).forEach(month => {
          const monthStr = month < TWO_DIGITS_MIN_NUMBER ? `0${month}` : month;
          const currentStartDay = year === startYear && month === currentStartMonth ? startDay : 1;
          const currentEndDay = year === endYear && month === currentEndMonth ? endDay : MAX_DAY;

          range(currentStartDay, currentEndDay + 1).forEach(day => {
            const dayStr = day < TWO_DIGITS_MIN_NUMBER ? `0${day}` : day;

            result.push(`${year}${monthStr}${dayStr}`);
          });
        });
      });

      return result;
    }
  };

  return OPTIONS[type];
}

export function detectTimeType(timeQuery) {
  const plainTimeQuery = isArray(timeQuery) ? flatten(timeQuery) : [timeQuery];
  const timeTypes = uniq(flatten(
    plainTimeQuery
      .map(queryDetail => Object.getOwnPropertySymbols(TIME_TYPE_PATTERNS)
        .filter(type => TIME_TYPE_PATTERNS[type].regularExp.test(queryDetail)))
  ));

  return timeTypes.length === 1 ? head(timeTypes) : null;
}

export function getTimeRange(query) {
  const type = detectTimeType(query);

  if (!type) {
    return null;
  }

  const extractor = extractLocalTimeRange(type);

  function getTimeByQueryType(option) {
    let result = null;

    if (isString(option)) {
      result = option;
    }

    if (isArray(option)) {
      result = extractor(option);
    }

    return result;
  }

  return compact(flatten(
    query.map(option => getTimeByQueryType(option))
  ));
}

/*
 *
 * Structure parseTimeResult, Object
 *   @attribute time, Int UTC milliseconds
 *   @attribute type, String One of available values "YEAR_TYPE"|"QUARTER_TYPE"|"MONTH_TYPE"|"WEEK_TYPE"|"DATE_TYPE"
 *
 * @param timeString, String
 * @return parseTimeResult
 */
export function parseTime(timeString) {
  const type = detectTimeType(timeString);

  if (!type) {
    return null;
  }

  const patternDate = TIME_TYPE_PATTERNS[type].patternDate;
  const timeMoment = utc(timeString, patternDate);
  const timeType = Symbol.keyFor(type);

  if (!timeMoment.isValid()) {
    return null;
  }

  return {
    type: timeType,
    time: timeMoment.valueOf()
  };
}

export function formatTime(timeDescriptor) {
  const {millis, timeType} = timeDescriptor;
  const TYPE = timeType ? Symbol.for(timeType) : Symbol.for('YEAR_TYPE');
  const formatDatePattern = TIME_TYPE_PATTERNS[TYPE].formatDate;

  return utc(millis).format(formatDatePattern);
}
