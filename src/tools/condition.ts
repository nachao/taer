import { get } from 'lodash';
import { FieldType } from '../consts';
import { IFieldTypes } from '../declare';

// 前置条件
export enum ConditionMode {
    Equal = 'equal to',
    NotEqual = 'not equal to',
}

// 参数类型
export type ConditionType = { [key: string]: FieldType }


// 字段展示前置条件
export interface ICondition {

    // 字段
    key: string;

    // 值，不设置则为空
    value?: any;

    // 匹配方式
    // 默认未 Eq
    mode?: ConditionMode;
}


// 前置条件
export class Conditions {

    // 解析指定字段
    parse(data: any, conditions: ICondition[][], types: IFieldTypes = {}): boolean {
        if (!data) return true;
        if (!conditions || conditions.length == 0) return true;

        // 解析
        const conditionOr = conditions.map(cAnd => cAnd.every(c => this.parseCondition(data, c, types)));
        const result = conditionOr.some(is => !!is);

        return result;
    }

    // 根据前置条件，解析是否展示
    // 没有则默认为展示
    private parseCondition(data: any, condition: ICondition, types: IFieldTypes) {
        const type = types[condition.key];
        const received = get(data, condition.key);
        const expected = condition.value;

        switch(condition.mode) {
            case ConditionMode.Equal:
                return this.parseConditionEqual(received, expected, type);
            case ConditionMode.NotEqual:
                return this.parseConditionNotEqual(received, expected, type);
            default:
                return this.parseConditionEqual(received, expected, type);
        }
    }

    /**
     * 匹配相等
     */
    private parseConditionEqual(received: any, expected: any, type: FieldType) {
        if (type === FieldType.Boolean)
            return !!received === !!expected;
        return (received || '') == (expected || '');
    }

    /**
     * 匹配不等
     */
    private parseConditionNotEqual(received: any, expected: any, type: FieldType) {
        if (type === FieldType.Boolean)
            return !!received !== !!expected;
        return (received || '') != (expected || '');
    }
}