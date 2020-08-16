
// 字段类型
export enum EntityType {
    String = 'EntityTypeString',
    Boolean = 'EntityTypeBoolean',
    Number = 'EntityTypeNumber',
    List = 'EntityTypeList',
    Date = 'EntityTypeDate',
}

// 字段中间件
export enum EntityMiddleware {
    useInited = 'useInited',
    useChange = 'useChange',
    useDisabled = 'useDisabled',
    useShow = 'useShow',
    useVerify = 'useVerify',
    useParam = 'useParam',
}

// 字段回调
export enum EntityEvents {
    onInited = 'onInited',
    onChange = 'onChange',
    onDisabled = 'onDisabled',
    onShow = 'onShow',
    onDepend = 'onDepends',
}

// 字段预置属性
export enum EntityPresetProperty {
    Disabled,
    KeyName,
    Value,
    Show,
    Label,
    Type,
}