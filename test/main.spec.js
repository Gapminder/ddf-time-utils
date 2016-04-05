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
  describe('when correct sets of data (in fixtures/good-cases)', () => {
    Object.getOwnPropertySymbols(goodCasesFixtures).forEach(timeType => {
      describe(`for '${Symbol.keyFor(timeType)}' type`, () => {
        it(`result for simple
        query '${JSON.stringify(goodCasesFixtures[timeType].simple)}' should be expected`, () => {
          const simpleResult = ddfTimeUtils.getTimeRange(goodCasesFixtures[timeType].simple);

          expect(_.isEqual(simpleResult, goodCasesFixtures[timeType].simple)).to.be.true;
        });

        it(`result for multiple
        query '${JSON.stringify(goodCasesFixtures[timeType].multiple.query)}' should be expected`, () => {
          const multipleResult = ddfTimeUtils.getTimeRange(goodCasesFixtures[timeType].multiple.query);

          expect(_.isEqual(multipleResult, goodCasesFixtures[timeType].multiple.result)).to.be.true;
        });
      });
    });
  });

  describe('when incorrect query', () => {
    Object.getOwnPropertySymbols(incorrectQueries.queries).forEach(queryType => {
      describe(`and type is '${Symbol.keyFor(queryType)}'`, () => {
        const errorDescription = 'Wrong time query format';

        it(`error '${errorDescription}' should be thrown`, () => {
          const result = ddfTimeUtils.getTimeRange(incorrectQueries.queries[queryType]);

          expect(result).to.be.null;
        });
      });
    });
  });
});
