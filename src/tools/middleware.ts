import { IAnyObject, IFunc } from '../declare';
import { isFunction, isArray } from './utils';

export interface IMiddlewareFnProps extends IAnyObject {
    value?: any,
    $prevent?: () => void,
}

// 中间件定义方法
// export type IMiddlewareFn<T = any, K = any> = (option?: T) => K;

/**
 * 中间件（责任链模式）
 * 
 * 主要是对固定值，进行不限制的进行链计算，
 * 并返回计算后的新值，如果不返回任何值，则值不变的状态下继续执行链计算
 * 可以在任何节点终止之后的链计算
 */
export class Middleware<T> {

    public _middlewares: Map<T, IFunc[]> = new Map;

    public use(mode: T, execute: IFunc) {
        if (this._middlewares.has(mode))
            this._middlewares.set(mode, []);

        if (isFunction(execute)) {
            const arr = this._middlewares.get(mode) || [];
            arr.push(execute);
            this._middlewares.set(mode, arr);
        }
    }

    /**
     * 执行指定一组中间件 
     */
    public run<K extends IMiddlewareFnProps>(mode: T, customProps: any = {}) {
        const chains = this._middlewares.get(mode);
        let result = { value: customProps.value };
        let process = true;

        if (isArray(chains)) {
            for (let i = 0; i < chains.length; i++) {

                // 提供的是函数，且没有阻止后续操作时，执行
                if (isFunction(chains[i]) && process) {
                    const option = {
                        ...customProps,
                        value: result.value,
                        $prevent: () => process = false,
                    } as K;

                    try {
                        const value = chains[i](option);

                        // 如果中间件有返回值，则直接覆盖之前的值
                        if (value !== undefined) {
                            result.value = value;
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        }

        return result.value;
    }
}
