import { FieldType } from "./consts";

export declare type IFitler = (value: any, index: number) => boolean;

// 字段类型对象
export type IFieldTypes = { [key: string]: FieldType };

// 对象
export type IAnyObject = { [key: string]: any };

// 单参数函数
export type IFunc<T = any, K = any> = (option?: T) => K;