
// 字段中间件
export enum FieldMiddleware {
    useInited = 'useInited',
    useChange = 'useChange',
    useDisabled = 'useDisabled',
    useShow = 'useShow',
    useVerify = 'useVerify',
    useParam = 'useParam',
}

// 字段回调
export enum FieldEvents {
    onInited = 'onInited',
    onChange = 'onChange',
    onDisabled = 'onDisabled',
    onShow = 'onShow',
    onDepend = 'onDepends',
}

// 字段预置属性
export enum FieldPresetProperty {
    Disabled,
    KeyName,
    Value,
    Show,
    Label,
    Type,
}