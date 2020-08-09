import { IMiddlewareFnProps } from "../tools/middleware";
import { TaerField } from "./field-controller";
import { IFunc, IAnyObject } from "../declare";
import { IEventFnProps } from "../tools/events";

// 携带字段
export interface IWithFieldOption {
    field: TaerField;
}

// ====

// 中间件 方法参数
export interface IFieldMiddlewareOption extends IMiddlewareFnProps, IWithFieldOption {

}

// 字段依赖 中间件方法参数
export interface IDependFieldMOption extends IFieldMiddlewareOption {
    depend: TaerField;
}

// 参数化 中间件方法参数
export interface IParamFieldMOption extends IFieldMiddlewareOption {
    query: IAnyObject;
}

// 单个字段中间件，用于设置值使用
export interface ITaerFieldMiddleware {

    // 定义字段唯一主键
    // useKeyName?: IFunc<IFieldMOption, string>;

    // 定义字段名称
    // useLabel?: IFunc<IFieldMOption, string>;

    // 定义字段类型
    // useType?: IFunc<IFieldMOption, FieldType>;

    // 定义字段修改的值
    useChange?: IFunc<IFieldMiddlewareOption>;

    // 定义依赖字段（改成 field.setDepends() 方法）
    // useDepends?: IFunc<IFieldMOption, TaerField[]>;

    // 当 onChange 和 onDepends 被触发后都会触发此中间件
    useDisabled?: IFunc<IFieldMiddlewareOption, boolean>;

    // 当 onChange 和 onDepends 被触发后都会触发此中间件
    useShow?: IFunc<IFieldMiddlewareOption, boolean>;

    // 定义提交时的数据格式化
    // 此中间件只接受 对象 返回值
    useParam?: IFunc<IParamFieldMOption, IAnyObject>;
}

// 字段参数
export type IFieldProps = IFieldEvents & ITaerFieldMiddleware;

// 过滤器
export declare type IFieldFitler = (field: TaerField) => boolean;

// 规则
export interface IRule<T> {
    execute(...option: TaerField[]): T;
    depends?: TaerField[] | string[];
}

// ====

// 监听使用方法参数
export interface IFieldEventOption extends IEventFnProps, IWithFieldOption {
}

// 字段依赖 中间件方法参数
export interface IDependFieldEOption extends IFieldEventOption {
    depend: TaerField;
}

// 观察者，用于监听变化
export interface IFieldEvents {

    // 值修改时
    onChange?: IFunc<IFieldEventOption>;

    // 字段对象化后
    onInited?: IFunc<IFieldEventOption>;

    // 禁用状态改变时
    onDisabled?: IFunc<IFieldEventOption>;

    // 展示状态改变时
    onShow?: IFunc<IFieldEventOption>;

    // 使用 useDepdends 设置的依赖字段，当任意字段值发生修改时触发
    onDepend?: IFunc<IDependFieldEOption>;
}
