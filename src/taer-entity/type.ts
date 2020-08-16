import { EntityType } from "./consts";
import { isArray, toString } from "../tools/index";

// 根据数据类型格式化数据
export function parseValueOfType(value: any, type: string) {
    switch (type) {
        case EntityType.Number: 
            return +value || undefined;
        case EntityType.Boolean: 
            return !!value;
        case EntityType.List: 
            return isArray(value) ? value : [value];
        case EntityType.String: 
            return toString(value);
        default:
            return toString(value);
    }
}