import { IAnyObject } from '../declare';

export type ICallback = (...data: any[]) => void;

export interface IEventFnProps extends IAnyObject {
    value?: any,

    // 移除此监听
    $remove?: () => void,
}

// 事件
export class Events<T> {

    private _events: Map<T, ICallback[]> = new Map;

    // 记录每个定义的最后一次结果
    private _logs: Map<T, any[]> = new Map;

    public on(key: T, callback: ICallback, immediately = true) {
        if (typeof callback === 'function') {
            const events = this._events.get(key) || [];
            events.push(callback);
            this._events.set(key, events);

            /**
             * 如果设置了立即生效，且有最近一次的修改值，则立即触发
             */
            if (immediately && this._logs.has(key)) {
                callback(...this._logs.get(key));
            }
        }
        return this;
    }

    public dispatch<K = IEventFnProps>(key: T, customOption: any = {}) {
        const events = this._events.get(key) || [];
        for(let i=0; i<events.length; i++) {
            const option = {
                ...customOption,
                $remove: () => events.splice(i, 1),
            } as K;

            try {
                events[i](option);

                // 始终覆盖的方式，记录最近一次结果
                this._logs.set(key, [option]);
            } catch (err) {
                console.error(err);
            }
        }
    }

    public destroy(key: T) {
        this._events.delete(key);
    }

    public clear() {
        Array(this._events.keys()).forEach((key: any) => {
            this.destroy(key);
        });
    }
}
