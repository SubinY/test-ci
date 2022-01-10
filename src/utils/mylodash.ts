const isNumber = (val) => typeof val === 'number' && val === val
const isBoolean = (val) => typeof val === 'boolean'
const isNil = (val) => val === undefined || val === null
const isString = (val) => typeof val === 'string'
const _isEmpty = (val) => val == null || !(Object.keys(val) || val).length
const isObject = (obj) => obj === Object(obj)
const flatten = (arr, depth = 1) =>
  arr.reduce(
    (a, v) =>
      a.concat(depth > 1 && Array.isArray(v) ? flatten(v, depth - 1) : v),
    []
  )
const merge = (...objs) =>
  [...objs].reduce(
    (acc, obj) =>
      Object.keys(obj).reduce((a, k) => {
        acc[k] = acc.hasOwnProperty(k)
          ? [].concat(acc[k]).concat(obj[k])
          : obj[k]
        return acc
      }, {}),
    {}
  )
const fromPairs = (arr) =>
  arr.reduce((a, [key, val]) => ((a[key] = val), a), {})
const omit = (obj, arr) =>
  Object.keys(obj)
    .filter((k) => !arr.includes(k))
    .reduce((acc, key) => ((acc[key] = obj[key]), acc), {})
const memoize = (fn) => {
  const cache = new Map()
  const cached = function(val) {
    return cache.has(val)
      ? cache.get(val)
      : cache.set(val, fn.call(this, val)) && cache.get(val)
  }
  cached.cache = cache
  return cached
}
const get = (from, ...selectors) =>
  [...selectors].map((s) =>
    s
      .replace(/\[([^\[\]]*)\]/g, '.$1.')
      .split('.')
      .filter((t) => t !== '')
      .reduce((prev, cur) => prev && prev[cur], from)
  )

export {
  isNumber,
  isBoolean,
  isNil,
  isString,
  _isEmpty,
  isObject,
  flatten,
  merge,
  fromPairs,
  omit,
  memoize,
  get
}
