import { FieldType } from "../consts";
import { isArray, toString } from 'lodash';

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