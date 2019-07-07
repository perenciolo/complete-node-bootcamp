function mostre(s) {
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

  console.log('ni', numsIn);

  console.log('l', letter);
}

mostre('a12c56a1b5');
