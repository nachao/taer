# Taer
![](https://img.shields.io/badge/build-passing-brightgreen) ![](https://img.shields.io/bundlephobia/min/taer) ![](https://img.shields.io/github/license/nachao/taer)![GitHub release (latest by date)](https://img.shields.io/github/v/release/nachao/taer?style=plastic)![GitHub stars](https://img.shields.io/github/stars/nachao/taer?style=social)

前端元数据开发工具，用于管理元数据，然后在组件中使用。

![logoko](./logo.png)

**说明**
此工具不局限于前端框架、UI库等，因为这只是一种开发方式。在定义数据结构上，请遵循提供的规则外，其他描述完全按需加入即可。


元数据的单元为实体，一个实体数据的结构：

- 实体描述

- 异步操作定义

- 字段描述定义

  


元数据用于描述任意一个实体数据（entity），例如一个最简单的 表单 实体数据：
```json
{
    get: "/a",
    fields: [
        { name: "name", label: "姓名" },
        { name: "age", label: "年龄" },
        { name: "sex", label: "性别" },
    ]
}
```

而自动中具体需要定义哪些熟悉，完全取决于业务需求。例如需要表单的提交验证，则可以在字段配置中加入。

**目前提供的工具有：**

- TaerField 字段操作

- TaerServer 异步操作

  

## TaerField
将 entity.fields 转换为对象管理，以满足开发中的需求。例如：

- 字段的值管理；
- 字段的验证规则；
- 字段之间的依赖关系；
- ...



在组件直接引入和实例：
```ts
const filedController = new TaerFields(entity.fields); 
```
在DOM中遍历（以react为例）
```jsx
<div>
    { 
        filedController.fields.map(field => (
            <label>
                <span>{ field.label }</span>
                <input value={ field.value } onclick={e => field.value = e.target.value } />
            </label>
        ))
    }
</div>
```

上面的使用中，就是一个简单的基于数组遍历出DOM，没有使用 TaerField 的任何能力。

分别提供了 **.use() ** 和 **.on()** 两个方法，定义字段的扩展功能。 



### useChange(option: IFieldMiddlewareOption): any 

在字段的值发生修改时，立即触发的钩子，且可以对值进行处理。它在 onChange 之前执行。


例如我们需要 age 字段为 Number 数值，则需要对其值进行格式化：
```ts
filedController.use({
    useChange: ({ value, field }) => {
        return field.key === 'age' ? Number(value) : value;
    }
})
```
这样此字段数据始终是 Number 类型。



### useDisabled(option: IFieldMiddlewareOption): boolean

解析字段的禁用规则，以下情况下触发：

- 此字段的 值 触发后；
- 依赖字段的 值 修改时，使用 setDepends() 设置依赖字段；



### useShow(option: IFieldMiddlewareOption): boolean

解析字段的展示规则，以下情况下触发：

- 此字段的 值 触发后；

- 依赖字段的 值 修改时，使用 setDepends() 设置依赖字段；

  

### useParam(option: IFieldMiddlewareOption): IAnyObject

获取字段的参数化，例如前端数据格式和后端不同时，调用 **fieldControler.toParam()** 方法时执行。

例如日期参数，前端是 [Date, Date] 格式，后端期望是 "xxxxxxxxx,xxxxxxxxx" 格式：

```ts
filedController.use({
    useParam: ({ field }) => {
        if (field.type === 'date') {
			return { [field.key]: field.value.map(d.getTime()).join(',') };
        }
    }
})
```





### setKeyName(key: string)

设置字段的主键，默认为字段中的 “key” 属性。



### setType(type: FieldType)

设置字段的类型，字段默认 类型 为 **FieldType.String**。



### setDepends(fields: TaerField[]) 

设置字段的依赖字段，当 fields 中的字段 值 发生变化时，会触发 onDepends 观察。



### onInited(option: IFieldEOption)

当字段对象化后，可以在此钩子使用上面的 set 方法，进行需求定义。



### onChange(option: IFieldEOption)

当字段值修改时触发。



### onDisabled(option: IFieldEOption)

当字段的 disabled 属性变更时触发，只有当定义过字段的 useDisabled 后才会发生变化。



### onShow(option: IFieldEOption)

当字段 “展示状态” 变更时，只有当字段定义过 useShow 后才会发生变化。



### onDepends(option: IDependFieldEOption)

当依赖字段的 值 发生修改时，使用 field.setDepends() 设置依赖字段。





## TaerServer<T>

数据服务操作功能，初始化时传入 url  参数，默认请求方式为 get。

```ts
const serverController = new TaerServer(entity.url)
```


属性：

- data 响应的数据
- msg 响应的提示文本
- state 响应状态
- res 响应对象
- load 请求状态



### send()

发起请求。



### prevent()

执行 send() 方法后，可以在 onRequestBefore 钩子中，进行阻止请求操作。



### useParams(option: IServerParamMiddlewareOption): IAnyObject

在请求发起先触发，默认会返回请求基本信息 url、method 的对象。可以结合 fieldController.toParam() 方法，得到字段参数化对象，整合到请求数据中。



### useRequest(option: IServerRequestMiddlewareOption): Promise<T>

定义请求方式，不设置的话则不会进行网络请求。



### useResStatus(option: IServerResMiddlewareOption): boolean | string

定义解析数据响应后的状态，定义后使用 serverController.state 才有值。



### useResMessage(option: IServerResMiddlewareOption): string

定义响应后的描述文本，定义后使用 serverController.msg 才有值。



### useResData(option: IServerResMiddlewareOption): any

定义响应后的存储数据，定义后使用 serverController.data 才有值。



### useResErrMessage(option: IServerResMiddlewareOption): string

定义请求报错时的反馈文本，定义后使用 serverController.msg 才有值。