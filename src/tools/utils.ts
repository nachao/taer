import { FieldType } from "../consts";

const hasOwnProperty = Object.prototype.hasOwnProperty

// 根据数据类型格式化数据
export function parseValueOfType(value: any, type: string) {
    switch (type) {
        case FieldType.Number: 
            return +value || undefined;
        case FieldType.Boolean: 
            return !!value;
        case FieldType.List: 
            return isArray(value) ? value : [value];
        case FieldType.String: 
            return toString(value);
        default:
            return toString(value);
    }
}

export function isFunction(value) {
    return typeof value === 'function';
}

export function isArray(value) {
    return value != null && typeof value !== 'function' && typeof value.length === 'number';
}

export function getTag(value) {
    return Object.prototype.toString.call(value);
}

export function isSymbol(value) {
    const type = typeof value
    return type == 'symbol' || (type === 'object' && value != null && getTag(value) == '[object Symbol]')
}

export function toString(value) {
    if (value == null) {
      return ''
    }
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value === 'string') {
      return value
    }
    if (Array.isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return `${value.map((other) => other == null ? other : toString(other))}`
    }
    if (isSymbol(value)) {
      return value.toString()
    }
    const result = `${value}`
    return (result == '0' && (1 / value) == -Infinity) ? '-0' : result
}

export function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
}

export function has(object, key) {
    return object != null && hasOwnProperty.call(object, key)
}

export function isObjectLike(value) {
    return typeof value === 'object' && value !== null
}