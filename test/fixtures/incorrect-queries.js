'use strict';

const EMPTY_QUERY = Symbol.for('Empty query');
const NOT_TIME_QUERY = Symbol.for('Not time query');
const MULTI_TIME_QUERY = Symbol.for('Multi time query');

exports.queries = {
  [EMPTY_QUERY]: [],
  [NOT_TIME_QUERY]: ['foo'],
  [MULTI_TIME_QUERY]: ['2015', '2011q1']
};

exports.EMPTY_QUERY = EMPTY_QUERY;
exports.NOT_TIME_QUERY = NOT_TIME_QUERY;
exports.MULTI_TIME_QUERY = MULTI_TIME_QUERY;
