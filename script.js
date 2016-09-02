'use strict';

const ddfTimeUtils = require('./');
let example;

/*********************************************************************************************************************/

function makeTest(example) {
  const result = ddfTimeUtils.parseTime(example);
  if (result) {
    console.log("result", result, new Date(result.parsed).toUTCString());
  } else {
    console.log("failed", example);
  }
}

/*********************************************************************************************************************/

// YEAR TYPE
example = '1991';
makeTest(example);

// QUARTER TYPE
example = '1990q1';
makeTest(example);
example = '1990q2';
makeTest(example);
example = '1990q3';
makeTest(example);
example = '1990q4';
makeTest(example);
example = '1990q5';
makeTest(example);

// MONTH TYPE
example = '198311';
makeTest(example);
example = '19832';
makeTest(example);
example = '198302';
makeTest(example);
example = '198344';
makeTest(example);

// DATE TYPE
example = '20101125';
makeTest(example);
example = '2010125';
makeTest(example);
example = '2010148';
makeTest(example);

// WEEK TYPE
example = '1825w2';
makeTest(example);
example = '1825w30';
makeTest(example);
example = '2000w52';
makeTest(example);
example = '2000w53';
makeTest(example);

console.log(ddfTimeUtils);