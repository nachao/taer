import { FieldType } from '../consts';
import { IFieldTypes } from '../declare';

// 前置条件
export enum ConditionMode {
    Equal = 'Equal',
    NotEqual = 'NotEqual',
    LessThen = 'LessThen',
    GreaterThen = 'GreaterThen',
    Include = 'Include',
}

// 字段展示前置条件
export interface ICondition {

    // 字段
    key: string;

    // 值，不设置则为空
    value?: any;

    // 匹配方式
    // 默认未 Equal
    mode?: ConditionMode;
}


// 前置条件
export class Conditions {

    // 解析指定字段
    // conditions 第一层数组为 或，第二层数据为 且
    parse(data: any, conditions: ICondition[][], types: IFieldTypes = {}): boolean {
        if (!data) return true;
        if (!conditions || conditions.length == 0) return true;
        return conditions.map(cAnd => cAnd.every(c => this.parseCondition(data, c, types))).some(is => !!is);
    }

    // 解析单个条件
    parseCondition(data: any, condition: ICondition, types: IFieldTypes = {}) {
        const type = types[condition.key];
        const received = data[condition.key];
        const expected = condition.value;

        switch(condition.mode) {
            case ConditionMode.Equal:
                return this.parseConditionEqual(received, expected, type);
            case ConditionMode.NotEqual:
                return this.parseConditionNotEqual(received, expected, type);
            case ConditionMode.GreaterThen:
                return received > expected;
            case ConditionMode.LessThen:
                return received < expected;
            case ConditionMode.Include:
                return received?.includes(expected);
            default:
                return this.parseConditionEqual(received, expected, type);
        }
    }

    // 匹配相等
    private parseConditionEqual(received: any, expected: any, type: FieldType) {
        if (type === FieldType.Boolean) return !!received === !!expected;
        return (received || '') == (expected || '');
    }

    // 匹配不等
    private parseConditionNotEqual(received: any, expected: any, type: FieldType) {
        if (type === FieldType.Boolean) return !!received !== !!expected;
        return (received || '') != (expected || '');
    }
}