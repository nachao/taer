import { IMiddlewareFnProps } from "../tools/middleware";
import { TaerEntity } from "./taer-entity";
import { IEventFnProps } from "../tools/events";
import { EntityType } from "./consts";
import { IAnyObject, IFunc } from "../declare";

// 类型对象
export type IEntityTypes = { [key: string]: EntityType };

// 携带字段
export interface IWithEntityOption {
    entity: TaerEntity;
}

// ====

// 中间件 方法参数
export interface IEntityMiddlewareOption extends IMiddlewareFnProps, IWithEntityOption {

}

// 字段依赖 中间件方法参数
export interface IDependEntityMOption extends IEntityMiddlewareOption {
    depend: TaerEntity;
}

// 参数化 中间件方法参数
export interface IParamEntityMOption extends IEntityMiddlewareOption {
    query: IAnyObject;
}

// 单个字段中间件，用于设置值使用
export interface ITaerEntityMiddleware {

    // 定义字段修改的值
    useChange?: IFunc<IEntityMiddlewareOption>;

    // 当 onChange 和 onDepends 被触发后都会触发此中间件
    useDisabled?: IFunc<IEntityMiddlewareOption, boolean>;

    // 当 onChange 和 onDepends 被触发后都会触发此中间件
    useShow?: IFunc<IEntityMiddlewareOption, boolean>;

    // 定义提交时的数据格式化
    // 此中间件只接受 对象 返回值
    useParam?: IFunc<IParamEntityMOption, IAnyObject>;
}

// 字段参数
export type IEntityProps = IEntityEvents & ITaerEntityMiddleware;

// 过滤器
export declare type IEntityFitler = (entity: TaerEntity) => boolean;

// 规则
export interface IRule<T> {
    execute(...option: TaerEntity[]): T;
    depends?: TaerEntity[] | string[];
}

// ====

// 监听使用方法参数
export interface IEntityEventOption extends IEventFnProps, IWithEntityOption {
}

// 字段依赖 中间件方法参数
export interface IDependEntityEOption extends IEntityEventOption {
    depend: TaerEntity;
}

// 观察者，用于监听变化
export interface IEntityEvents {

    // 值修改时
    onChange?: IFunc<IEntityEventOption>;

    // 字段对象化后
    onInited?: IFunc<IEntityEventOption>;

    // 禁用状态改变时
    onDisabled?: IFunc<IEntityEventOption>;

    // 展示状态改变时
    onShow?: IFunc<IEntityEventOption>;

    // 使用 useDepdends 设置的依赖字段，当任意字段值发生修改时触发
    onDepend?: IFunc<IDependEntityEOption>;
}
