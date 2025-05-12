const diacritics = {
  a: 'áÁä',
  c: 'čČ',
  d: 'ďĎ',
  e: 'éÉěĚ',
  i: 'íÍ',
  l: 'ľĺĽĹ',
  n: 'ňŇ',
  o: 'óÓô',
  r: 'řŘ',
  s: 'Šš',
  t: 'ťŤ',
  u: 'úÚ',
  y: 'ýÝ',
  z: 'žŽ'
};

export const replaceDiacritics = (text) => {
  let res = '';
  for (const c of text) {
    let c_added = false;
    for (const toLetter in diacritics) {
      //@ts-ignore
      if (diacritics[toLetter].indexOf(c) !== -1) {
        res += toLetter;
        c_added = true;
        break;
      }
    }
    if (!c_added) {
      res += c.toLocaleLowerCase();
    }
  }
  return res;
};

export const formatError = (err) => {
  if (err.response && err.response.data) {
    if (err.response.status === 413) {
      return 'Obrázok je príliž veľký. Vyberte menší obrázok.';
    }
    let errStr = err.response.data.message;
    if (err.response.data.reason?.length > 0) {
      errStr +=
        ', ' +
        err.response.data.reason
          .map((item) => {
            return `${item.msg} (${item.param})`;
          })
          .join(', ');
    }
    return errStr;
  } else {
    return err.message;
  }
};
