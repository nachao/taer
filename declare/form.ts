
// 表单
export interface IForm<ViewNameEnum, ViewTypeEnum, CompType> {
    
    // 所有视图组件
    _view: IViewItem<ViewNameEnum, ViewTypeEnum, CompType>[]; 

    // _model: 
}


/**
 * 单个视图组件
 * 
 * 用于定义渲染组件
 */
export interface IViewItem
<

    // 视图名称枚举
    ViewNameEnum,

    // 视图类型枚举
    ViewTypeEnum,

    // 视图框架组件类型
    CompType
>
{

    // 试图名称，需要预算枚举
    name: ViewNameEnum;

    // 视图类型，用于关联字段类型，需要预算枚举
    type: ViewTypeEnum;

    // 组件，
    comp: CompType;
}



/**
 * 单个数据模型
 * 
 * 用于描述一个字段的基本信息
 */
export interface IModelField
<

    // 视图类型枚举
    ViewTypeEnum
>
extends
    IModelFieldBase,
    IModelFieldRelateToView<ViewTypeEnum>,
    IModelFieldVarifyRule,
    ImodelFieldSyncRule
{

    // 是否自读
    isReady?: boolean;

    // 是否隐藏
    isHide?: boolean;

    // 是否为数组格式
    isArray?: boolean;

    // 固定文本
    // format = FormatTypes.Text 时生效
    text?: string;

    // 直接指定值，默认以 text 渲染
    value?: any;

    // 过滤映射的 entityName
    // 为 true 时，需要同时设置 filterEnumEntity 才效果 
    filters?: string;

    // 使用映射的 value 作为存储值
    // 默认使用 key 为存储值
    // 此设置不影响展示，进在存储时的判断逻辑变更
    useFilterValue?: boolean;

    // 默认值
    // 如果是枚举，则默认选择，如果无初始值，则默认使用
    defaultValue?: any;

    // 是否可以点击跳转
    // 链接地址
    link?: string;

    // 无值时的提示
    placeholder?: string;

    // 宽度
    width?: number;

    // 是否是数字输入框
    isNumberInput?: boolean;

    // 子表
    // childrenFormEntity?: string;

    // 嵌套实体
    // 例如：嵌套一个列表 和 一个添加数据的弹框
    // childrenEntitys?: string[];

    // 嵌套实体
    nestEntity?: string;

    // 如果是嵌套表单，是否继承值
    isInherit?: boolean;

    // 排序索引
    // 最小 0, 值越小越排前，默认 10
    sortIndex?: number;

    // 备注
    comment?: string;

    // 展示的联动字段
    // 以及此字段的匹配值
    // 一维数组是 逻辑或
    // 子数组内是 逻辑且
    // showPremiseField?: FieldPreCondition[][];

    // 如果是单选、多选
    // 是否为按钮风格
    isButtonStyle?: boolean;

    // 附件是否多选
    // 默认否
    isMultipleUpload?: boolean;  

    // 数据扩展 ----

    // 修改值后立即提交
    changedAfterSubmit?: boolean;

    // 是否可以快速清空
	enabledValueClear?: boolean;
	
	// 日期类型解析方式 ----

	// 是否拆分成两个字段
	isDateSplit?: boolean;

	// 拆分字段
	dateSplitStartKey?: string;
    dateSplitEndKey?: string;
    
    // 数据同步 ----

    // 文本展示后缀
    textSuffix?: string;

    // 自定义渲染
    costomFormat?: string;
}



/**
 * 字段模型基础信息
 */
interface IModelFieldBase {

    // 数据字段
    key?: string;

    // 字段名称
    label?: string;
}



/**
 * 字段模型与视图关联
 */
interface IModelFieldRelateToView<ViewTypeEnum> {

    // 模型渲染方式
    type: ViewTypeEnum;
}



/**
 * 字段模型的校验规则
 */
interface IModelFieldVarifyRule {

    // 是的进行校验
    verifyEnable?: boolean;

    // 数组时最小长度，默认为0；
    verifyMinLen?: number;

    // 自定义验证规则（正则）
    verifyRegular?: string;

    // 验证错误提示
    verifyErrorMessage?: string;

    // 验证成功提示
    verifySuccessMessage?: string;

    // 是否必填
    verifyReqired?: boolean;

    // 规则提示文本
    verifyImplyMessage?: string;
}



/**
 * 字段数据同步规则
 */
interface ImodelFieldSyncRule {

    // 同步值到URL
    syncValueToURL?: boolean;

    // 同步到当前页内的参数
    syncValueToPage?: boolean;

    // 同步参数到值
    syncParamToValue?: boolean;
}