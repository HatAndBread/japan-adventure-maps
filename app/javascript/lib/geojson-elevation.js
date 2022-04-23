export const sma = (arr, range, precision) => {
  if (!Array.isArray(arr)) {
    throw TypeError('expected first argument to be an array');
  }

  precision = precision || 2;
  var num = range || arr.length;
  var res = [];
  var len = arr.length + 1;
  var idx = num - 1;
  while (++idx < len) {
    const value = avg(arr, idx, num);
    res.push(round(value, precision));
  }
  return res;
};

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

/**
 * Create an average for the specified range.
 *
 * @param  {Array} `arr` Array to pull the range from.
 * @param  {Number} `idx` Index of element being calculated
 * @param  {Number} `range` Size of range to calculate.
 * @return {Number} Average of range.
 */

function avg(arr, idx, range) {
  return sum(arr.slice(idx - range, idx)) / range;
}

/**
 * Calculate the sum of an array.
 * @param  {Array} `arr` Array
 * @return {Number} Sum
 */

function sum(arr) {
  var len = arr.length;
  var num = 0;
  while (len--) num += Number(arr[len]);
  return num;
}

export const movingAverageWithWindow = (numberOfPoints) => {
  return (el, index, array) => {
    const center = Math.floor(numberOfPoints / 2);
    const lowerBound = index - center;
    let upperBound = index + center + 1;
    if (index < center) {
      return el;
    }
    if (upperBound > array.length) {
      upperBound = array.length;
    }
    let acc = 0;
    const windowing = array.slice(lowerBound, upperBound);
    for (const ele of windowing) {
      acc += ele;
    }
    return acc / numberOfPoints;
  };
};

export const computeElevationGain = (accumulator, currentValue, index, array) => {
  const previousValue = array[index - 1];
  const delta = currentValue - previousValue;
  // Take only positive value
  if (delta > 0) {
    accumulator += delta;
  }
  return accumulator;
};

export const getElevationGain = (geojson) => {
  if (!geojson) return 0;
  const numberOfPoints = 10;
  const elevations = geojson.map((x) => x.e);
  const smaElevations = sma(elevations, numberOfPoints, 2);
  return Math.round(smaElevations.reduce(computeElevationGain, 0));
};

export default { movingAverageWithWindow, computeElevationGain, getElevationGain, sma };
