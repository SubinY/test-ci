import classNames from "classnames";
import {
  isNumber,
  isBoolean,
  isNil,
  isString,
  _isEmpty,
  isObject,
  flatten
} from "./mylodash";

export const noop = () => {};

// null=> true
// true=> true
// 1 => false
// [1,2]=> false
// {} => true
// {a:'1'} => false
export const isEmpty = value => {
  if (isNumber(value) || isBoolean(value)) {
    return false;
  }
  if (isNil(value)) {
    return true;
  }
  if (isString(value)) {
    return value.length === 0;
  }
  return _isEmpty(value);
};
export const isNotEmpty = value => {
  return !isEmpty(value);
};
export const toBoolean = value => {
  if (isEmpty(value)) {
    return false;
  }
  if (isString(value)) {
    const p = value.toLowerCase().trim();
    if (p === "true") {
      return true;
    }
    if (p === "false") {
      return false;
    }
  }
  return value;
};

export function parseJSON(json) {
  if (isObject(json)) {
    return json;
  }
  if (isString(json)) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return {};
    }
  }
  console.warn("shouldBeObject is not controlled value", json);
  return json;
}

/**
 *
 * mode
 *
 * @returns {{mode: (function(*=): (*)), classNames: (function(*=, ...[*]=): string)}}
 */
export function getExtMode(...props) {
  const modeList = flatten(props).filter(isNotEmpty);

  const buildWithPrefix = prefix => {
    if (isEmpty(prefix)) {
      return prefix;
    }
    const list = modeList.map(it => {
      if (isObject(it)) {
        return Object.keys(it).map(key => (it[key] ? key : ""));
      }
      return it;
    });
    return flatten(list)
      .filter(it => isNotEmpty(it))
      .map(it => `${prefix}--${it.trim()}`);
  };

  return {
    mode: buildWithPrefix,
    classNames: function(prefix, ...others) {
      return classNames(prefix, others, buildWithPrefix(prefix));
    }
  };
}

export const debounce = (fn, ms = 0) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

/**
 * try/catch helper
 * @param {Promise} promise
 */
export async function promiseHandle(promise) {
  try {
    const result = await promise;
    return [null, result];
  } catch (err) {
    return [err, null];
  }
}

export const throttle = (fun, delay) => {
  let last = 0;
  return (...params) => {
    const now = +new Date();
    if (now - last > delay) {
      fun.apply(this, params);
      last = now;
    }
  };
};

export const flattenTree = (tree, field = "name", level, connector = "") => {
  const result = [];
  let record = 0;
  const deepFn = (arr, text) => {
    arr.map(b => {
      const _text = text + b[field];
      if (record > level) return result.push(_text);
      if (b?.children) {
        record++;
        b.children.map(deepFn(b, _text));
      }
    });
  };
};
