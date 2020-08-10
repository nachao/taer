import { FieldType } from '../consts';
import { parseValueOfType, cloneDeep, isFunction, has, isObjectLike } from '../tools/utils';
import { Events } from '../tools/events';
import { Conditions, ICondition } from '../tools/condition';
import { Middleware } from '../tools/middleware';
import { IFieldTypes } from '../declare';
import { IParamFieldMOption, IFieldProps, IFieldFitler } from './declare';
import { FieldEvents, FieldMiddleware } from './consts';

export class TaerFields<T = any> {

    private _fields: T[];

    public fields: TaerField[] = [];
    public fieldObjs: { [key: string]: TaerField } = {};

    init(
        fields: T[],
        fieldOption?: IFieldProps
    ) {
        this._fields = fields;

        /**
         * 这里必须先 创建完成所有 字段实例，
         * 然后再调用所有字段对象的 init 方法,
         * 因为，初始化后会触发各种生命周期，为了支持建立 字段 之间的关系
         */
        this.fields = this._fields.map(fieldMetadata => new TaerField<T>(cloneDeep(fieldMetadata), this));
        this.fields.forEach((field) => field.init(fieldOption));

        // 创建索引
        this.createIndex()
    }

    // 转换为对象数据
    toJSON(filter?: IFieldFitler, preset = {}) {
        const result = {...preset};
        this.filter(filter).forEach(field => result[field.key] = field.value);
        return result;
    }

    // 转换为参数格式
    toParam(filter?: IFieldFitler, preset = {}) {
        const result = {...preset};
        this.filter(filter).forEach(field => Object.assign(result, field.param));
        return result;
    }

    // 获取字段 元数据
    toFields() {
        return this._fields;
    }

    // 获取字段的Key数组
    toKeys(filter?: IFieldFitler, preset = []) {
        const result = [...preset];
        this.filter(filter).forEach(field => result.push(field.key));
        return result;
    }

    // 获取字段的Key数组
    toTypes(filter?: IFieldFitler, preset = {}): IFieldTypes {
        const result = {...preset};
        this.filter(filter).forEach(field => Object.assign(result, { [field.key]: field.type }));
        return result;
    }

    // 验证
    verify() {
        const result = {}
        this.fields
            .map(field => [field.parseVerify(), field])
            .filter(([err]) => !!err)
            .forEach(([err, field]: [any, TaerField]) => result[field.key] = err);
        return result;
    }

    // 更新值
    setData(data: any = {}) {
        this.fields.forEach(field => {
            if (field.key in data) {
                field.value = data[field.key];
            }
        })
    }

    // 获取一堆字段
    getFields(keys: string[]) {
        return this.fields.filter(f => keys.includes(f.key))
    }

    // 获取单个字段
    getField(key: string) {
        return this.fields.find(f => f.key === key);
    }

    // ====

    // 创建快捷对象
    private createIndex() {
        this.fields.forEach(field => this.fieldObjs[field.key] = field);
    }

    // 过滤字段
    private filter(filter?: IFieldFitler) {
        return this.fields.filter(field => isFunction(filter) ? filter(field) : true);
    }
}

export class TaerField<T = any> {

    // 扩展能力
    private _event: Events<FieldEvents> = new Events;
    private _middleware: Middleware<FieldMiddleware> = new Middleware;
    private _condition: Conditions = new Conditions;

    // 状态
    private _store = new Map;
    private _disabled: boolean;
    private _show: boolean;
    private _val: any;

    // 基础数据
    private _keyName = 'key';
    private _label: string;
    private _type: FieldType = FieldType.String;

    public target: T;

    constructor(
        target?: T,
        private controller?: TaerFields,
    ) {
        this.target = target;
    }

    init(option?: IFieldProps) {
        if (option) {
            this.use(option);
            this.on(option);
        }

        // 获取主键定义（仅在初始化执行一次）
        // this.runKeyName();
        // this.runType();
        // this.runLabel();

        // init middleware
        // const field = this._middleware.run(FieldMiddleware.useDepends, { field: this });
        // this.setDepends(field);

        // init evet
        // 此周期必须在所有定义执行完成后
        this.runInited();
    }

    // 中间件
    use(option: IFieldProps) {
        // this._middleware.use(FieldMiddleware.useKeyName, option.useKeyName);
        // this._middleware.use(FieldMiddleware.useLabel, option.useLabel);
        this._middleware.use(FieldMiddleware.useChange, option.useChange);
        // this._middleware.use(FieldMiddleware.useDepends, option.useDepends);
        this._middleware.use(FieldMiddleware.useDisabled, option.useDisabled);
        this._middleware.use(FieldMiddleware.useShow, option.useShow);
        this._middleware.use(FieldMiddleware.useParam, option.useParam);
        // this._middleware.use(FieldMiddleware.useType, option.useType);
    }

    // 监听
    on(option: IFieldProps) {
        this._event.on(FieldEvents.onChange, option.onChange);
        this._event.on(FieldEvents.onDisabled, option.onDisabled);
        this._event.on(FieldEvents.onDepend, option.onDepend);
        this._event.on(FieldEvents.onInited, option.onInited);
    }

    // 常用类型 ====

    get value() {
        return this._val;
    }
    set value(value: any) {
        this.runChange(value);
    }

    // 提交时的参数
    get param() {
        return this.runParam();
    }

    // 是否禁用
    get disabled() {
        return this._disabled;
    }

    // 是否展示
    get show() {
        return this._show;
    }

    // 字段主键
    get key() {
        if (has(this.target, this._keyName))
            return this.target[this._keyName];
        return Math.random().toString(32).slice(2);
    }

    // 字段名称
    get label() {
        return this._label;
    }

    // 字段类型
    get type() {
        return this._type;
    }

    // 字段状态管理
    set(key: any, value: any) {
        this._store.set(key, value);
    }
    get(key: any) {
        this._store.get(key);
    }
    del(key: any) {
        this._store.delete(key);
    }

    // 解析条件规则
    parseCondition(rules: ICondition[][]): boolean {
        const data = this.controller.toJSON();
        const types = this.controller.toTypes();
        return this._condition.parse(data, rules, types);
    }

    // 解析验证
    parseVerify() {
        return this._middleware.run(FieldMiddleware.useVerify, { field: this });
    }

    // 重置
    resetValue() {
        this.runChange(undefined);
    }

    // ====

    // 设置 依赖字段
    public setDepends(fields: TaerField[]) {
        fields && fields.forEach(field => {
            if (field instanceof TaerField) {
                field.on({ onChange: () => {
                    this.runDepends(field);
                    this.runDisabled(field);
                    this.runShow(field);
                }});
            }
        })
    }

    // 设置 字段主键
    public setKeyName(key: string) {
        this._keyName = key;
        // this._keyName = this._middleware.run(FieldMiddleware.useKeyName, { value: this._keyName, field: this });
    }

    // 设置 字段类型 
    public setType(type: FieldType) {
        this._type = type;
        // this._type = this._middleware.run(FieldMiddleware.useType, { value: FieldType.String, field: this });
    }

    // 设置 字段名词
    public setLabel(label: string) {
        this._label = label;
        // this._label = this._middleware.run(FieldMiddleware.useLabel, { value: this.key, field: this });
    }

    // ====

    // 调用 赋值 中间件/回调
    private runChange(value: any) {
        const typeValue = parseValueOfType(value, this.type)
        this._val = this._middleware.run(FieldMiddleware.useChange, { value: typeValue, field: this });
        this._event.dispatch(FieldEvents.onChange, { field: this, value: this._val });
        this.runDisabled(this);
        this.runShow(this);
    }

    // 调用 依赖 回调
    private runDepends(depend: TaerField) {
        this._event.dispatch(FieldEvents.onDepend, { field: this, depend });
    }

    // 调用 禁用 中间件/回调
    private runDisabled(depend: TaerField) {
        this._disabled = this._middleware.run(FieldMiddleware.useDisabled, { value: false, field: this, depend });
        this._event.dispatch(FieldEvents.onDisabled, { field: this });
    }

    // 调用 是否展示 中间件/回调
    private runShow(depend: TaerField) {
        this._disabled = this._middleware.run(FieldMiddleware.useShow, { value: false, field: this, depend });
        this._event.dispatch(FieldEvents.onShow, { field: this });
    }

    // 调用 参数化 中间件
    private runParam() {
        const value = { [this.key]: this.value }
        const newParam = this._middleware.run<IParamFieldMOption>(FieldMiddleware.useParam, { value, field: this });
        if (isObjectLike(newParam)) {
            return newParam;
        } else if (newParam !== undefined) {
            return { [this.key]: newParam };
        }
        return value;
    }

    // 调用 字段初始化 回调
    private runInited() {
        this._event.dispatch(FieldEvents.onInited, { field: this });
    }
}