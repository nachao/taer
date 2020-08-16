import { IParamEntityMOption, IEntityProps, IEntityFitler, IEntityTypes } from './declare';
import { EntityType, EntityEvents, EntityMiddleware, EntityPresetProperty } from './consts';
import { Events, Middleware, Conditions, ICondition, parseValueOfType, isFunction, has, isObjectLike } from '../tools/index';

/**
 * 全部都以 entity 为单位定义。
 * 
 * 将 entity 进行树形结构管理。
 */
export class TaerEntity<T = any> {

    // 扩展能力
    private _event: Events<EntityEvents> = new Events;
    private _middleware: Middleware<EntityMiddleware> = new Middleware;
    private _condition: Conditions<IEntityTypes> = new Conditions;
    private _store = new Map()

    constructor(
        // 元数据
        public metadata: T,

        // 父级，顶级entity的parent为null
        public parent?: TaerEntity,

        // 子集
        public childrens: TaerEntity[] = [],
    ) {
    }

    // 初始化
    init(option?: IEntityProps) {
        if (option) {
            this.use(option);
            this.on(option);
        }

        this.runInited();
    }

    // 中间件
    use(option: IEntityProps) {
        this._middleware.use(EntityMiddleware.useChange, option.useChange);
        this._middleware.use(EntityMiddleware.useDisabled, option.useDisabled);
        this._middleware.use(EntityMiddleware.useShow, option.useShow);
        this._middleware.use(EntityMiddleware.useParam, option.useParam);
    }

    // 监听
    on(option: IEntityProps) {
        this._event.on(EntityEvents.onChange, option.onChange);
        this._event.on(EntityEvents.onDisabled, option.onDisabled);
        this._event.on(EntityEvents.onDepend, option.onDepend);
        this._event.on(EntityEvents.onInited, option.onInited);
    }

    // 常用属性 ====

    // 值操作
    get value(): any {
        return this.get(EntityPresetProperty.Value);
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
        return this.get(EntityPresetProperty.Disabled);
    }

    // 是否展示
    get show(): boolean {
        return this.get(EntityPresetProperty.Show)
    }

    // 字段主键
    get key(): string {
        const keyName: string = this.get(EntityPresetProperty.KeyName)
        if (has(this.metadata, keyName)) return this.metadata[keyName];
        return Math.random().toString(32).slice(2);
    }

    // 字段名称
    get label(): string {
        return this.get(EntityPresetProperty.Label);
    }

    // 字段类型
    get type(): EntityType {
        return this.get(EntityPresetProperty.Type);
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
        const data = this.parent.getJSON();
        const types = this.parent.getTypes();
        return this._condition.parse(data, rules, types);
    }

    // 解析验证
    parseVerify() {
        return this._middleware.run(EntityMiddleware.useVerify, { entity: this });
    }

    // 重置
    resetValue() {
        this.runChange(undefined);
    }

    // ====

    // 设置 依赖字段
    public setDepends(Entitys: TaerEntity[]) {
        Entitys?.forEach(entity => {
            if (entity instanceof TaerEntity) {
                entity.on({ onChange: () => {
                    this.runDepends(entity);
                    this.runDisabled(entity);
                    this.runShow(entity);
                }});
            }
        })
    }

    // 设置 字段主键
    public setKeyName(value: string) {
        this.set(EntityPresetProperty.KeyName, value);
    }

    // 设置 字段类型 
    public setType(value: EntityType) {
        this.set(EntityPresetProperty.Type, value);
    }

    // 设置 字段名称
    public setLabel(value: string) {
        this.set(EntityPresetProperty.Label, value);
    }

    /****************************************
     * 子集的全部操作，可以抽离出来
     */

    // 添加 子集
    public addChild(entity: TaerEntity) {
        this.childrens.push(entity);
    }

    // 设置 子集 数据，根据 key 进行赋值
    public setChildData(data: any = {}) {
        this.childrens.forEach(child => {
            if (child.key in data) {
                child.value = data[child.key];
            }
        })
    }

    // 获取 子集数组，支持过滤
    public gatChildrens(filter?: IEntityFitler) {
        return this.childrens.filter(entity => isFunction(filter) ? filter(entity) : true);
    }

    // 获取 子集数组，根据唯一标识数组
    public getChildrensOfKeys(keys: string[]) {
        return this.childrens.filter(f => keys.includes(f.key))
    }

    // 获取 子集，根据唯一标识
    public getChildrenOfKey(key: string) {
        return this.childrens.find(f => f.key === key);
    }

    // 获取 子集 纯数据格式
    public getJSON(filter?: IEntityFitler, preset = {}) {
        const result = {...preset};
        this.gatChildrens(filter).forEach(entity => result[entity.key] = entity.value);
        return result;
    }

    // 获取 子集 参数格式
    public getParam(filter?: IEntityFitler, preset = {}) {
        const result = {...preset};
        this.gatChildrens(filter).forEach(entity => Object.assign(result, entity.param));
        return result;
    }

    // 获取 子集 所有唯一标识
    public getKeys(filter?: IEntityFitler, preset = []) {
        const result = [...preset];
        this.gatChildrens(filter).forEach(entity => result.push(entity.key));
        return result;
    }

    // 获取 子集 所有类型信息
    public getTypes(filter?: IEntityFitler, preset = {}): IEntityTypes {
        const result = {...preset};
        this.gatChildrens(filter).forEach(entity => Object.assign(result, { [entity.key]: entity.type }));
        return result;
    }

    // 执行 子集 所有校验
    public runVerify() {
        const result = {}
        this.childrens
            .map(entity => [entity.parseVerify(), entity])
            .filter(([err]) => !!err)
            .forEach(([err, entity]: [any, TaerEntity]) => result[entity.key] = err);
        return result;
    }

    // ====

    // 调用 赋值 中间件/回调
    private runChange(value: any) {
        const typeValue = parseValueOfType(value, this.type)
        const newValue = this._middleware.run(EntityMiddleware.useChange, { value: typeValue, entity: this });
        this.set(EntityPresetProperty.Value, newValue);

        this._event.dispatch(EntityEvents.onChange, { entity: this, value: newValue });
        this.runDisabled();
        this.runShow();
    }

    // 调用 依赖 回调
    private runDepends(depend: TaerEntity) {
        this._event.dispatch(EntityEvents.onDepend, { entity: this, depend });
    }

    // 调用 禁用 中间件/回调
    private runDisabled(depend?: TaerEntity) {
        this.set(EntityPresetProperty.Disabled, this._middleware.run(EntityMiddleware.useDisabled, { value: false, entity: this, depend }));
        this._event.dispatch(EntityEvents.onDisabled, { entity: this });
    }

    // 调用 是否展示 中间件/回调
    private runShow(depend?: TaerEntity) {
        this.set(EntityPresetProperty.Show, this._middleware.run(EntityMiddleware.useShow, { value: false, entity: this, depend }));
        this._event.dispatch(EntityEvents.onShow, { entity: this });
    }

    // 调用 参数化 中间件
    private runParam() {
        const value = { [this.key]: this.value }
        const newParam = this._middleware.run<IParamEntityMOption>(EntityMiddleware.useParam, { value, entity: this });
        if (isObjectLike(newParam)) {
            return newParam;
        } else if (newParam !== undefined) {
            return { [this.key]: newParam };
        }
        return value;
    }

    // 调用 字段初始化 回调
    private runInited() {
        this._event.dispatch(EntityEvents.onInited, { entity: this });
    }
}