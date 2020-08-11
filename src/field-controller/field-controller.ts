import { FieldType } from '../consts';
import { parseValueOfType, cloneDeep, isFunction, has, isObjectLike } from '../tools/utils';
import { Events } from '../tools/events';
import { Conditions, ICondition } from '../tools/condition';
import { Middleware } from '../tools/middleware';
import { IFieldTypes } from '../declare';
import { IParamFieldMOption, IFieldProps, IFieldFitler } from './declare';
import { FieldEvents, FieldMiddleware, FieldPresetProperty } from './consts';

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
    private _store = new Map()

    constructor(
        public target: T,
        private controller?: TaerFields,
    ) {
        this.target = target;
    }

    // 初始化
    init(option?: IFieldProps) {
        if (option) {
            this.use(option);
            this.on(option);
        }

        this.runInited();
    }

    // 中间件
    use(option: IFieldProps) {
        this._middleware.use(FieldMiddleware.useChange, option.useChange);
        this._middleware.use(FieldMiddleware.useDisabled, option.useDisabled);
        this._middleware.use(FieldMiddleware.useShow, option.useShow);
        this._middleware.use(FieldMiddleware.useParam, option.useParam);
    }

    // 监听
    on(option: IFieldProps) {
        this._event.on(FieldEvents.onChange, option.onChange);
        this._event.on(FieldEvents.onDisabled, option.onDisabled);
        this._event.on(FieldEvents.onDepend, option.onDepend);
        this._event.on(FieldEvents.onInited, option.onInited);
    }

    // 常用属性 ====

    // 值操作
    get value(): any {
        return this.get(FieldPresetProperty.Value);
    }
    set value(value: any) {
        this.runChange(value);
    }

    // 提交时的参数
    get param() {
        return this.runParam();
    }

    // 是否禁用
    get disabled(): boolean {
        return this.get(FieldPresetProperty.Disabled);
    }

    // 是否展示
    get show(): boolean {
        return this.get(FieldPresetProperty.Show)
    }

    // 字段主键
    get key(): string {
        const keyName: string = this.get(FieldPresetProperty.KeyName)
        if (has(this.target, keyName)) return this.target[keyName];
        return Math.random().toString(32).slice(2);
    }

    // 字段名称
    get label(): string {
        return this.get(FieldPresetProperty.Label);
    }

    // 字段类型
    get type(): FieldType {
        return this.get(FieldPresetProperty.Type);
    }

    // 字段状态管理
    set<T>(key: any, value: T) {
        this._store.set(key, value);
    }
    get<T>(key: any) {
        const value = this._store.get(key);
        return value as T;
    }
    del(key: any) {
        this._store.delete(key);
    }

    // 解析条件规则，需要特定格式见 ICondition
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
        fields?.forEach(field => {
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
    public setKeyName(value: string) {
        this.set(FieldPresetProperty.KeyName, value);
    }

    // 设置 字段类型 
    public setType(value: FieldType) {
        this.set(FieldPresetProperty.Type, value);
    }

    // 设置 字段名词
    public setLabel(value: string) {
        this.set(FieldPresetProperty.Label, value);
    }

    // ====

    // 调用 赋值 中间件/回调
    private runChange(value: any) {
        const typeValue = parseValueOfType(value, this.type)
        const newValue = this._middleware.run(FieldMiddleware.useChange, { value: typeValue, field: this });
        this.set(FieldPresetProperty.Value, newValue);

        this._event.dispatch(FieldEvents.onChange, { field: this, value: newValue });
        this.runDisabled();
        this.runShow();
    }

    // 调用 依赖 回调
    private runDepends(depend: TaerField) {
        this._event.dispatch(FieldEvents.onDepend, { field: this, depend });
    }

    // 调用 禁用 中间件/回调
    private runDisabled(depend?: TaerField) {
        this.set(FieldPresetProperty.Disabled, this._middleware.run(FieldMiddleware.useDisabled, { value: false, field: this, depend }));
        this._event.dispatch(FieldEvents.onDisabled, { field: this });
    }

    // 调用 是否展示 中间件/回调
    private runShow(depend?: TaerField) {
        this.set(FieldPresetProperty.Show, this._middleware.run(FieldMiddleware.useShow, { value: false, field: this, depend }));
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