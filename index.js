'use strict';

const _ = require('lodash');
const moment = require('moment');

const Symbol = require('es6-symbol');

const TWO_DIGITS_MIN_NUMBER = 10;
const MAX_MONTH = 12;
const MAX_DAY = 31;
const FIRST_MATCH = 1;
const SECOND_MATCH = 2;
const THIRD_MATCH = 3;
const THIRD_ELEMENT = 2;

const YEAR_TYPE = Symbol.for('YEAR_TYPE');
const QUARTER_TYPE = Symbol.for('QUARTER_TYPE');
const MONTH_TYPE = Symbol.for('MONTH_TYPE');
const WEEK_TYPE = Symbol.for('WEEK_TYPE');
const DATE_TYPE = Symbol.for('DATE_TYPE');

const YEAR_PATTERN = /^(\d{3,4})$/;
const QUARTER_PATTERN = /^(\d{3,4})q(\d{1})$/;
const MONTH_PATTERN = /^(\d{3,4})(\d{2})$/;
const WEEK_PATTERN = /^(\d{3,4})w(\d{1,2})$/;
const DATE_PATTERN = /^(\d{3,4})(\d{2})(\d{2})$/;

const TIME_TYPE_PATTERNS = {
  [YEAR_TYPE]: {
    regularExp: YEAR_PATTERN,
    patternDate: 'YYYY'
  },
  [QUARTER_TYPE]: {
    regularExp: QUARTER_PATTERN,
    patternDate: 'YYYY Q'
  },
  [MONTH_TYPE]: {
    regularExp: MONTH_PATTERN,
    patternDate: 'YYYYMM'
  },
  [WEEK_TYPE]: {
    regularExp: WEEK_PATTERN,
    patternDate: 'YYYY W'
  },
  [DATE_TYPE]: {
    regularExp: DATE_PATTERN,
    patternDate: 'YYYYMMDD'
  }
};

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

    _.range(startYear, endYear + 1).forEach(year => {
      const startValue = year === startYear ? startSecondMatch : settings.minLimit;
      const endValue = year === endYear ? endSecondMatch : settings.maxLimit;

      _.range(startValue, endValue + 1).forEach(valueParam => {
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

      return _.range(sYear, fYear + 1)
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

      _.range(startYear, endYear + 1).forEach(year => {
        const currentStartMonth = year === startYear ? startMonth : 1;
        const currentEndMonth = year === endYear ? endMonth : MAX_MONTH;

        _.range(currentStartMonth, currentEndMonth + 1).forEach(month => {
          const monthStr = month < TWO_DIGITS_MIN_NUMBER ? `0${month}` : month;
          const currentStartDay = year === startYear && month === currentStartMonth ? startDay : 1;
          const currentEndDay = year === endYear && month === currentEndMonth ? endDay : MAX_DAY;

          _.range(currentStartDay, currentEndDay + 1).forEach(day => {
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

function detectTimeType(timeQuery) {
  const plainTimeQuery = _.isArray(timeQuery) ? _.flatten(timeQuery) : [timeQuery];
  const timeTypes = _.uniq(_.flatten(
    plainTimeQuery
      .map(queryDetail => Object.getOwnPropertySymbols(TIME_TYPE_PATTERNS)
        .filter(type => TIME_TYPE_PATTERNS[type].regularExp.test(queryDetail)))
  ));

  return timeTypes.length === 1 ? _.head(timeTypes) : null;
}

function getTimeRange(query) {
  const type = detectTimeType(query);

  if (!type) {
    return null;
  }

  const extractor = extractLocalTimeRange(type);

  function getTimeByQueryType(option) {
    let result = null;

    if (_.isString(option)) {
      result = option;
    }

    if (_.isArray(option)) {
      result = extractor(option);
    }

    return result;
  }

  return _.compact(_.flatten(
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
function parseTime(timeString) {
  const type = detectTimeType(timeString);

  if (!type) {
    return null;
  }

  const patternDate = TIME_TYPE_PATTERNS[type].patternDate;
  const timeMoment = moment.utc(timeString, patternDate);
  const timeType = Symbol.keyFor(type);

  if (!timeMoment.isValid()) {
    return null;
  }

  return {
    type: timeType,
    time: timeMoment.valueOf()
  };
}

exports.YEAR_TYPE = YEAR_TYPE;
exports.QUARTER_TYPE = QUARTER_TYPE;
exports.MONTH_TYPE = MONTH_TYPE;
exports.WEEK_TYPE = WEEK_TYPE;
exports.DATE_TYPE = DATE_TYPE;
exports.getTimeRange = getTimeRange;
exports.detectTimeType = detectTimeType;
exports.parseTime = parseTime;

exports.TIME_TYPES = Object.getOwnPropertySymbols(TIME_TYPE_PATTERNS);
exports.TIME_TYPES_AS_STRINGS = exports.TIME_TYPES.map(Symbol.keyFor);
