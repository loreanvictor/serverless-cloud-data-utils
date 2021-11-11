<div align="center">

<img src="./serverless-data.svg" width="64px"/>
  
# Utilities for [Serverless Data](https://www.serverless.com/cloud/docs/apps/data)

[![tests](https://img.shields.io/github/workflow/status/loreanvictor/serverless-cloud-data-utils/Test%20and%20Report%20Coverage?label=tests&logo=mocha&logoColor=green)](https://github.com/loreanvictor/serverless-cloud-data-utils/actions?query=workflow%3A%22Test+and+Report+Coverage%22)
[![security](https://img.shields.io/github/workflow/status/loreanvictor/serverless-cloud-data-utils/CodeQL?label=security)](https://github.com/loreanvictor/serverless-cloud-data-utils/actions?query=workflow%3A%22CodeQL%22)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/e40ed7b97c1c4e6982f64e6644aabf0f)](https://www.codacy.com/gh/loreanvictor/serverless-cloud-data-utils/dashboard?utm_source=github.com&utm_medium=referral&utm_content=loreanvictor/serverless-cloud-data-utils&utm_campaign=Badge_Coverage)
[![version](https://img.shields.io/npm/v/serverless-cloud-data-utils?logo=npm)](https://www.npmjs.com/package/serverless-cloud-data-utils)

</div>
  
<br>
  
```bash
npm i serverless-cloud-data-utils
```

<br>

Utilities for working with [serverless cloud](https://www.serverless.com/cloud) [data APIs](https://www.serverless.com/cloud/docs/apps/data).
First you define your models and their indexes:

```ts
import { Model, buildIndex, timekey } from 'serverless-cloud-data-utils'


export const OrderId = buildIndex({ namespace: 'orders' })

export const OrderTime = buildIndex({
  namespace: 'orders',
  label: 'label1',
  converter: timekey
})

export const OrderOwner = owner => buildIndex({
  namespace: `orders_${owner.id}`,
  converter: timekey,
  label: 'label2'
})


export class Order extends Model<Order> {
  id: string
  owner: User
  amount: number
  date: string
  
  keys() {
    return [ OrderTime, OrderId, OrderOwner(this.owner) ]
  }
}
```

<br>

Then you can access your data in a consistent and type-safe way:

```ts
import { indexBy } from 'serverless-cloud-data-utils'
import { Order, OrderId, OrderTime, OrderOwner } from './order-model'


//
// get a single order by its id
//
const someOrder = await indexBy(OrderId).exact('some_id').get(Order)

//
// get latest orders of a specific user
//
const latestUserOrders = await indexBy(OrderOwner(user))
  .reverse()
  .limit(10)
  .get(Order)

//
// get orders from last month
//
const lastMonth = new Date()
lastMonth.setMonth(lastMonth.getMonth() - 1)

const ordersFromLastMotnh = await indexBy(OrderTime)
  .before(lastMonth.toISOString())
  .reverse()
  .get(Order)

//
// create a new order
//
const newOrder = new Order()
newOrder.amount = 42
newOrder.owner = user
newOrder.id = uuid.v4()
newOrder.date = new Date().toISOString()

await newOrder.save()

//
// update data for some order
//
someOrder.amount += 10
await someOrder.save()

//
// delete latest order from last month
//
await ordersFromLastMonth[0].remove()
```
