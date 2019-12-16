// ((V) -> T) -> [V] -> [T]
const map = fn => (array = []) => array.map(fn);

const flatMap = arrx => arrx.reduce((flat, arr) => flat.concat(arr), []);

const lift = fn => (...fnx) => v => fn.apply(undefined, fnx.map(fn => fn(v)));

const id = v => v;

const isNil = v => v === null || v === undefined;

const tap = fn => v => (fn(v), v);

// [string] -> Object -> Any
const path = path => data => path.reduce((data, pathItem) => (data || {})[pathItem], data);
const path2 = (path, data) => path.reduce((data, pathItem) => (data || {})[pathItem], data);

const range = (start, end) =>
  (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);

const put = (path, value, obj) => {
  let o = obj;
  while (path.length - 1) {
    const n = path.shift();
    if (!(n in o)) o[n] = {};
    o = o[n]
  }
  o[path[0]] = value;

  return obj;
};

const groupBy = get => arr => arr.reduce(
  (map, i) => ({
    ...map,
    [get(i)]: [...(map[get(i)] || []), i]
  }),
  {}
);

// [Any -> Any]
const compose = (...fnx) => v => fnx.reduce((v, fn) => fn(v), v);

const delay = time => new Promise(resolve => setTimeout(resolve, time));

module.exports = {map, flatMap, lift, id, tap, path, path2, put, groupBy, range, isNil, compose};