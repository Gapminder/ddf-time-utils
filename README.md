# Gapminder DDF Time Utils

## Install

`npm i ddf-time-utils`

## Description

`ddf-time-utils` is created for DDF time format checking and manipulation.

## Exported constants

 * YEAR_TYPE
 * QUARTER_TYPE
 * MONTH_TYPE
 * WEEK_TYPE
 * DATE_TYPE

These constants describes five different kinds of time supported by DDF.

## Exported functions

 * getTimeRange(timeRangeQuery): timeRange
 * detectTimeType(time): timeType
 
More info - in `Examples` section.

## Examples

### Time type detection

```
const ddfTimeUtils = require('ddf-time-utils');

const resultYear = ddfTimeUtils.detectTimeType('2000');
const resultQuarter = ddfTimeUtils.detectTimeType('2000q1');
const resultMonth = ddfTimeUtils.detectTimeType('200001');
const resultWeek = ddfTimeUtils.detectTimeType('2000w01');
const resultDate = ddfTimeUtils.detectTimeType('2000102');

console.log(resultYear === ddfTimeUtils.YEAR_TYPE);
console.log(resultQuarter === ddfTimeUtils.QUARTER_TYPE);
console.log(resultMonth === ddfTimeUtils.MONTH_TYPE);
console.log(resultWeek === ddfTimeUtils.WEEK_TYPE);
console.log(resultDate === ddfTimeUtils.DATE_TYPE);
```

### Time type detection (incorrect time)

```
const ddfTimeUtils = require('ddf-time-utils');
const result = ddfTimeUtils.detectTimeType('200x0102');

console.log(result === null);
```

### Time range detection

```
const ddfTimeUtils = require('ddf-time-utils');

const simpleResult = ddfTimeUtils.getTimeRange(['1990']);
const multipleResult = ddfTimeUtils.getTimeRange(['1800', ['2013', '2015'], '2017', '980']);

console.log(simpleResult);
console.log(multipleResult);
```

Result:
```
[ '1990' ]
[ '1800', '2013', '2014', '2015', '2017', '980' ]
```

```
const ddfTimeUtils = require('ddf-time-utils');

const result = ddfTimeUtils.getTimeRange([['1990q1', '1992q2'], '1993q4']);

console.log(result);
```

Result:
```
[ '1990q1',
  '1990q2',
  '1990q3',
  '1990q4',
  '1991q1',
  '1991q2',
  '1991q3',
  '1991q4',
  '1992q1',
  '1992q2',
  '1993q4' ]
```

### Time range detection (incorrect way)

```
const ddfTimeUtils = require('ddf-time-utils');
// time range detection is possible only for same kind of time
// we have `year` and `quarter` types in same query
const result = ddfTimeUtils.getTimeRange(['2015', '2011q1']);

console.log(result);
```

Result:
```
null
```

```
const ddfTimeUtils = require('ddf-time-utils');
// unexpected time
const result = ddfTimeUtils.getTimeRange(['foo']);

console.log(result);
```

Result:
```
null
```
