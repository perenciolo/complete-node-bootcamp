/*function mostre(s) {
  let letter = [];
  let letterIn = [];
  let numsIn = [];
  function inside(s) {
    const index = Object.keys(s);
    const els = Object.values(s);
    index.forEach(i => {
      if (isNaN(+els[i])) {
        letter.push(els[i]);
        letterIn.push(i);
      }
    });
  }
  inside(s);

  letterIn.forEach((el, idx) => {
    const next = letterIn[idx + 1] || null;
    if (next) {
      numsIn.push(s.slice(+el + 1, next));
    } else {
      numsIn.push(s.slice(+el + 1));
    }
  });

  function handle(arr) {
    const step = [];
    if (arr && arr.length) {
      arr.forEach((el, i) => {
        const numVal = numsIn[i];
        step.push([el, numVal]);

        if (step[i] && step[i].indexOf(el) > -1) {
          const idxToSum = step[i].indexOf(el);
          console.log('idxToSum', idxToSum);
        }
      });

      return step;
    }

    return false;
  }

  console.log('ni', numsIn);

  console.log('l', handle(letter));
}*/

/**
 * Get duplicated elements in an array
 * @params array arr
 *
 * @returns array of duplicated elements.
 */
function duplicateds(arr) {
  var idxTable = {};
  var result = [];

  if (!arr || arr.length < 1) return null;

  // Populate index table.
  arr.forEach(el => {
    // If index does not exist create it.
    if (!idxTable[el]) {
      idxTable[el] = 0;
    }
    // For each element add 1 to the index table.
    idxTable[el] += 1;
  });

  // For each arr duplicated element save this index to result.
  for (let prop in idxTable) {
    // If duplicated prop
    if (idxTable[prop] > 1) {
      // Push index to result;
      result.push(prop);
    }
  }

  // Return result
  return result;
}

/**
 * Get all occurrences of a element in an array
 * @params array arr
 * @params any find
 *
 * @returns array indexes of a given element.
 */
function getAllOccurrences(arr, find) {
  if (!arr || !arr.length) return null;

  // a = accumulated initial [].
  // e = element.
  // i = index.
  return arr.reduce((a, e, i) => {
    // if element equals find push index to accumulated.
    if (e === find) {
      a.push(i);
    }

    // Return accumulated.
    return a;
  }, []);
}

/**
 *  Remove duplicated items from an array.
 *
 * @param array arr
 *
 * @returns array
 */
function removeDuplicates(arr) {
  if (!arr || !arr.length) return null;

  return arr.filter((item, position, self) => self.indexOf(item) === position);
}

function mostre(str) {
  if (!str || !str.length) return null;

  const letters = str.match(/(\D)+/g);
  const numbers = str.match(/(\d)+/g);

  // console.log('letters :', letters);
  // console.log('numbers :', numbers);

  const find = duplicateds(letters);
  // console.log('find :', find);
  const els = find.map(el => getAllOccurrences(letters, el));
  // console.log('els :', els);
  const numbersCopy = numbers.slice();
  // console.log('numbers :', numbers);

  let sum = els.map(el =>
    el.map(e => numbers[e]).reduce((acu, cur) => +acu + +cur)
  );
  // console.log('sum :', sum);

  // All not duplicated.
  els.forEach(el => {
    el.forEach(elm => {
      const i = numbers.indexOf(numbersCopy[elm]);
      numbers.splice(i, 1);
    });
  });

  // Add the sum to the first position of duplicated el.
  els.forEach((el, i) => {
    numbers.splice(els[i][0], 0, sum[i]);
  });

  // console.log('numbers :', numbers);

  const lettersSingle = removeDuplicates(letters);

  const final = lettersSingle
    .map((el, i) => [el, numbers[i]])
    .map(el => el.join(''))
    .join('');
  console.log('final :', final);
}

mostre('a12c56a1b5');
mostre('a12c56c2a1b5j654h77');
