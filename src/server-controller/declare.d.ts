import { IMiddlewareFnProps } from "../tools/middleware";
import { IAnyObject, IFunc } from "../declare";
import { ICallback, IEventFnProps } from "../tools/events";

// 中间件 方法参数
export interface IServerMiddlewareOption extends IMiddlewareFnProps {

}

// 请求方式 中间件方法参数
export interface IServerRequestMiddlewareOption extends IServerMiddlewareOption {
    query: IAnyObject;
}

// 参数化 中间件方法参数
export interface IServerParamMiddlewareOption extends IServerMiddlewareOption {
    query: IAnyObject;
}

// 响应 中间件方法参数
export interface IServerResMiddlewareOption extends IServerMiddlewareOption {
    res: any;
}

// 错误 中间件方法参数
export interface IServerErrMiddlewareOption extends IServerMiddlewareOption {
    err: any;
}

// 中间件
export interface ITaerServerMiddleware<T> {

    // 参数定义
    useParams?: IFunc<IServerParamMiddlewareOption, IAnyObject>;

    // 请求方式定义
    useRequest?: IFunc<IServerRequestMiddlewareOption, Promise<T>>;

    // 响应状态定义
    useResStatus?: IFunc<IServerResMiddlewareOption, boolean | string>;

    // 响应文本
    useResMessage?: IFunc<IServerResMiddlewareOption, string>;

    // 响应数据
    useResData?: IFunc<IServerResMiddlewareOption, any>;

    // 请求错误时，提示文本
    useResErrMessage?: IFunc<IServerErrMiddlewareOption, string>;
}

// ====

// 监听使用方法参数
export interface IServerEventOption extends IEventFnProps {
}

// 监听
export interface ITaerServerCallback {

    // 请求服务初始化后
    onInited?: IFunc<IServerEventOption>;

    // 参数格式化后，请求前。可以手动阻止请求。
    onRequestBefore?: IFunc<IServerEventOption>;

    // 请求完成后
    onRequestAfter?: IFunc<IServerEventOption>;
}

// 参数
export type IMiddlewareOption<T> = ITaerServerMiddleware<T> & ITaerServerCallback;