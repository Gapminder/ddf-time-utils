import * as chai from 'chai';
import { isEqual } from 'lodash';

const expect = chai.expect;

import * as ddfTimeUtils from '../src/index';

const goodCasesFixtures = require('./fixtures/good-cases');
const incorrectQueries = require('./fixtures/incorrect-queries');

describe('DDF time utils', () => {
  describe('when correct sets of time ranges (in fixtures/good-cases)', () => {
    Object.getOwnPropertySymbols(goodCasesFixtures).forEach(timeType => {
      describe(`for '${Symbol.keyFor(timeType)}' type`, () => {
        it(`should time range for simple
        query '${JSON.stringify(goodCasesFixtures[timeType].simple)}' be expected`, () => {
          const simpleResult = ddfTimeUtils.getTimeRange(goodCasesFixtures[timeType].simple);

          expect(isEqual(simpleResult, goodCasesFixtures[timeType].simple)).to.be.true;
        });

        it(`should time range for multiple
        query '${JSON.stringify(goodCasesFixtures[timeType].multiple.query)}' be expected`, () => {
          const multipleResult = ddfTimeUtils.getTimeRange(goodCasesFixtures[timeType].multiple.query);

          expect(isEqual(multipleResult, goodCasesFixtures[timeType].multiple.result)).to.be.true;
        });
      });
    });
  });

  describe('when incorrect time ranges query', () => {
    Object.getOwnPropertySymbols(incorrectQueries.queries).forEach(queryType => {
      describe(`and type is '${Symbol.keyFor(queryType)}'`, () => {
        const errorDescription = 'Wrong time query format';

        it(`should error '${errorDescription}' be thrown`, () => {
          const result = ddfTimeUtils.getTimeRange(incorrectQueries.queries[queryType]);

          expect(result).to.be.null;
        });
      });
    });
  });

  describe('when detect ddf compatible time types', () => {
    it('should types quantity be expected', () => {
      const EXPECTED_TYPES_QUANTITY = 6;

      expect(ddfTimeUtils.TIME_TYPES_DDF_COMPATIBLE.length).to.equal(EXPECTED_TYPES_QUANTITY);
    });

    it('should types content be expected', () => {
      const EXPECTED_TYPES_CONTENT = ['time', 'year', 'quarter', 'month', 'week', 'date'];

      expect(isEqual(ddfTimeUtils.TIME_TYPES_DDF_COMPATIBLE, EXPECTED_TYPES_CONTENT)).to.be.true;
    });
  });

  describe('when detect time type', () => {
    it('should year detection be correct', () => {
      const result = ddfTimeUtils.detectTimeType('2000');

      expect(result).to.equal(ddfTimeUtils.YEAR_TYPE);
    });

    it('should quarter detection be correct', () => {
      const result = ddfTimeUtils.detectTimeType('2000q1');

      expect(result).to.equal(ddfTimeUtils.QUARTER_TYPE);
    });

    it('should month detection be correct', () => {
      const result = ddfTimeUtils.detectTimeType('200001');

      expect(result).to.equal(ddfTimeUtils.MONTH_TYPE);
    });

    it('should week detection be correct', () => {
      const result = ddfTimeUtils.detectTimeType('2000w01');

      expect(result).to.equal(ddfTimeUtils.WEEK_TYPE);
    });

    it('should date detection be correct', () => {
      const result = ddfTimeUtils.detectTimeType('2000102');

      expect(result).to.equal(ddfTimeUtils.DATE_TYPE);
    });

    it('should incorrect time detection be null', () => {
      const result = ddfTimeUtils.detectTimeType('200x0102');

      expect(result).to.equal(null);
    });
  });

  describe('when parse time string', () => {
    describe('in Year Type Format', () => {
      it('should correctly detect year-time string', () => {
        const timeExample = '1991';
        const timeResult = 662688000000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.YEAR_TYPE));
        expect(result.time).to.equal(timeResult);
      });
    });
    describe('in Quarter Type Format', () => {
      it('should correctly detect quarter-time string for correct value', () => {
        const timeExample = '1990q1';
        const timeResult = 631152000000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.QUARTER_TYPE));
        expect(result.time).to.equal(timeResult);
      });
      it('should return null for incorrect time-string', () => {
        const timeExample = '1990q5';
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result).to.be.null;
      });
    });
    describe('in Month Type Format', () => {
      it('should correctly detect month-time string when month contain two chars', () => {
        const timeExample = '198311';
        const timeResult = 436492800000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.MONTH_TYPE));
        expect(result.time).to.equal(timeResult);
      });
      it('should correctly detect month-time string when month contain one char', () => {
        const timeExample = '19832';
        const timeResult = 412905600000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.MONTH_TYPE));
        expect(result.time).to.equal(timeResult);
      });
      it('should correctly detect month-time string when month contain two chars with lead zero', () => {
        const timeExample = '198302';
        const timeResult = 412905600000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.MONTH_TYPE));
        expect(result.time).to.equal(timeResult);
      });
      it('should return null for incorrect time-string', () => {
        const timeExample = '198344';
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result).to.be.null;
      });
    });
    describe('in Date Type Format', () => {
      it('should correctly detect date-time string', () => {
        const timeExample = '20101125';
        const timeResult = 1290643200000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.DATE_TYPE));
        expect(result.time).to.equal(timeResult);
      });
      it('should correctly detect date-time string when day contain one char', () => {
        const timeExample = '2010125';
        const timeResult = 1291507200000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.DATE_TYPE));
        expect(result.time).to.equal(timeResult);
      });
      it('should return null for incorrect date-time string', () => {
        const timeExample = '2010148';
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result).to.be.null;
      });
    });
    describe('in Week Type Format', () => {
      it('should correctly detect week-time string', () => {
        const timeExample = '1825w2';
        const timeResult = -4574966400000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.WEEK_TYPE));
        expect(result.time).to.equal(timeResult);
      });
      it('should correctly detect date-time string when day contain one char', () => {
        const timeExample = '1825w30';
        const timeResult = -4558032000000;
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result.type).to.equal(Symbol.keyFor(ddfTimeUtils.WEEK_TYPE));
        expect(result.time).to.equal(timeResult);
      });
      it('should return null for incorrect date-time string', () => {
        const timeExample = '2000w53';
        const result = ddfTimeUtils.parseTime(timeExample);

        expect(result).to.be.null;
      });
    });
  });
});
