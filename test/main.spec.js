'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const ddfTimeUtils = require('../');
const goodCasesFixtures = require('./fixtures/good-cases');
const incorrectQueries = require('./fixtures/incorrect-queries');

chai.use(sinonChai);

describe('DDF time utils', () => {
  describe('when correct sets of time ranges (in fixtures/good-cases)', () => {
    Object.getOwnPropertySymbols(goodCasesFixtures).forEach(timeType => {
      describe(`for '${Symbol.keyFor(timeType)}' type`, () => {
        it(`should time range for simple
        query '${JSON.stringify(goodCasesFixtures[timeType].simple)}' be expected`, () => {
          const simpleResult = ddfTimeUtils.getTimeRange(goodCasesFixtures[timeType].simple);

          expect(_.isEqual(simpleResult, goodCasesFixtures[timeType].simple)).to.be.true;
        });

        it(`should time range for multiple
        query '${JSON.stringify(goodCasesFixtures[timeType].multiple.query)}' be expected`, () => {
          const multipleResult = ddfTimeUtils.getTimeRange(goodCasesFixtures[timeType].multiple.query);

          expect(_.isEqual(multipleResult, goodCasesFixtures[timeType].multiple.result)).to.be.true;
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
});
