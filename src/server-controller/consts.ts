
// 加载状态
export enum ServerLoad {
    Rest,
    Before,
    Loading,
    Finish,
}

// 中间件
export enum ServerMiddleware {
    useInited,
    useParams,
    useRequest,
    useRequestBefore,
    useRequestAfter,
    useResStatus,
    useResMessage,
    useResErrMessage,
    useResData,
}

// 订阅
export enum ServerEvent {
    onInited,
    onRequestBefore,
    onRequestAfter
}