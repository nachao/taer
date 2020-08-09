// @ts-ignore
// import axios from 'axios';
import { Events } from '../tools/events';
import { Middleware } from '../tools/middleware';
import { ITaerServerMiddleware, ITaerServerCallback, IMiddlewareOption } from './declare';
import { ServerLoad, ServerEvent, ServerMiddleware } from './consts';
import { RequestMethods } from '../consts';

export class TaerServer<T = any> {

    private _event = new Events;
    private _middleware = new Middleware;

    // ----

    public url: string;
    public method: string;

    public res: any;
    public status: any;
    public msg: any;
    public data: any;
    public load: ServerLoad;

    // 设置基础参数
    init(
        url: string,
        option?: IMiddlewareOption<T>
    ) {
        this.url = url;

        if (option) {
            this.use(option);
            this.on(option);
        }

        // 完成初始化
        this._event.dispatch(ServerEvent.onInited);
    }

    // 设置中间件
    use(option: ITaerServerMiddleware<T>) {
        this._middleware.use(ServerMiddleware.useParams, option.useParams);
        this._middleware.use(ServerMiddleware.useRequest, option.useRequest);
        this._middleware.use(ServerMiddleware.useResData, option.useResData);
        this._middleware.use(ServerMiddleware.useResMessage, option.useResMessage);
        this._middleware.use(ServerMiddleware.useResErrMessage, option.useResErrMessage);        
        this._middleware.use(ServerMiddleware.useResStatus, option.useResStatus);
    }

    // 设置数据观察
    on(option: ITaerServerCallback) {
        this._event.on(ServerEvent.onRequestBefore, option.onRequestBefore);
        this._event.on(ServerEvent.onRequestAfter, option.onRequestAfter);
        this._event.on(ServerEvent.onInited, option.onInited);
    }

    // 发起请求
    send = () => {
        const option = this.getParams()

        this.setReset();
        this.setLoad(ServerLoad.Before);

        this._event.dispatch(ServerEvent.onRequestBefore);

        if (this.isUsable()) {
            this.setLoad(ServerLoad.Loading);
            return this.getRequest(option)
                .then((res: T) => {
                    this.res = res;
                    this.status = this._middleware.run(ServerMiddleware.useResStatus, { res });
                    this.msg = this._middleware.run(ServerMiddleware.useResMessage, { res });
                    this.data = this._middleware.run(ServerMiddleware.useResData, { res });
                })
                .catch((err: any) => {
                    this.msg = this._middleware.run(ServerMiddleware.useResErrMessage, { err });
                })
                .finally(() => {
                    this.setLoad(ServerLoad.Finish);
                    this._event.dispatch(ServerEvent.onRequestAfter);
                })
        } else {
            this.setLoad(ServerLoad.Rest);
        }

        return Promise.resolve();
    }

    // 阻止提交
    prevent() {
        this.setLoad(ServerLoad.Rest);
    }

    setMethod(method: RequestMethods) {
        this.method = method;
    }

    // ====

    // 数据请求服务
    private getRequest(option: any) {
        return this.runRequest(option);
    }

    // 重置请求服务
    private setReset() {
        this.msg = '';
        this.res = null;
        this.status = null;
        this.data = null;
        this.setLoad(ServerLoad.Rest);
    }

    private setLoad(load: ServerLoad) {
        this.load = load;
    }

    /**
     * 是否允许提交
     */
    private isUsable(): boolean {
        return !!this.url
            && !!this.method
            && this.load === ServerLoad.Before;
    }

    private getParams() {
        const query = {
            url: this.url,
            method: this.method,
        };
        return this._middleware.run(ServerMiddleware.useParams, { query, field: this });
    }

    // ====

    // 执行 请求方式 中间件
    private runRequest(option: any) {
        return this._middleware.run(ServerMiddleware.useRequest, { field: this, value: Promise.resolve(option), query: option });
    }
}
