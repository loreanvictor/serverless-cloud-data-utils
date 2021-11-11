<div align="center">

<img src="./serverless-data.svg" width="64px"/>
  
# Utilities for [Serverless Data](https://www.serverless.com/cloud/docs/apps/data)

[![tests](https://img.shields.io/github/workflow/status/loreanvictor/serverless-cloud-data-utils/Test%20and%20Report%20Coverage?label=tests&logo=mocha&logoColor=green)](https://github.com/loreanvictor/serverless-cloud-data-utils/actions?query=workflow%3A%22Test+and+Report+Coverage%22)
[![security](https://img.shields.io/github/workflow/status/loreanvictor/serverless-cloud-data-utils/CodeQL?label=security)](https://github.com/loreanvictor/serverless-cloud-data-utils/actions?query=workflow%3A%22CodeQL%22)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/e40ed7b97c1c4e6982f64e6644aabf0f)](https://www.codacy.com/gh/loreanvictor/serverless-cloud-data-utils/dashboard?utm_source=github.com&utm_medium=referral&utm_content=loreanvictor/serverless-cloud-data-utils&utm_campaign=Badge_Coverage)
[![version](https://img.shields.io/npm/v/serverless-cloud-data-utils?logo=npm)](https://www.npmjs.com/package/serverless-cloud-data-utils)

</div>

<br>

Utilities for working with [serverless cloud](https://www.serverless.com/cloud) [data APIs](https://www.serverless.com/cloud/docs/apps/data). By default, accessing and modifying data via `@serverless/cloud` API revolves around namespaces and key expressions, tracking which can be a headache (imagine a typo in a namespace or a key expression). With `serverless-cloud-data-utils`, you can define your models and their indexes (access paths) programmatically, and then access and modify your data in a consistent and type-safe manner.

<br>

## How to Install

Install via [NPM](https://www.npmjs.com/package/serverless-cloud-data-utils). Note that this library is a wrapper on top of [serverless cloud](https://www.serverless.com/cloud), so it would only work in an environment
where `@serverless/cloud` package is installed (and is not a mock), i.e. on serverless cloud apps and instances.
  
```bash
npm i serverless-cloud-data-utils
```

<br>

## How to Use

First you need to define your models and their indexes:

```ts
// order.model.ts

import { Model, buildIndex, indexBy, timekey } from 'serverless-cloud-data-utils'


export const OrderId = buildIndex({ namespace: 'orders' })

export const OrderTime = buildIndex({
  namespace: 'orders',
  label: 'label1',
  converter: timekey,    // --> timestamp strings are illegal by default, this converter takes care of that.
})

export const OrderOwner = owner => buildIndex({
  namespace: `orders_${owner.id}`,
  label: 'label2',
  converter: timekey,
})


export class Order extends Model<Order> {
  id: string
  owner: User
  amount: number
  date: string
  
  keys() {
    return [
      indexBy(OrderTime).exact(this.date),
      indexBy(OrderId).exact(this.id),
      indexBy(OrderOwner(this.owner)).exact(this.date),
    ]
  }
}
```

<br>

Now you can create and store new objects:

```ts
import { Order } from './order.model'

const newOrder = new Order()
newOrder.amount = 42
newOrder.user = someUser
newOrder.date = new Date().toISOString()
newOrder.id = uuid.v4()

await newOrder.save()
```

<br>

Modify objects:

```ts
myOrder.amount += 10
await myOrder.save()
```

<br>

Delete objects:

```ts
await someOrder.delete()
```

<br>

Get a specific object:

```ts
import { indexBy } from 'serverless-cloud-data-utils'
import { Order, OderId } from './order.model'

const order = await indexBy(OrderId).exact('some_id').get(Order)
```

<br>

Or query objects with specific indexes:

```ts
import { indexBy } from 'serverless-cloud-data-utils'
import { Order, OrderTime } from './order.model'

//
// fetch last 10 orders
//

const latestOrders = await indexBy(OrderTime)
  .limit(10)
  .reverse()
  .get(Order)
```
```ts
import { indexBy } from 'serverless-cloud-data-utils'
import { Order, OrderOwner } from './order.model'

//
// get orders of a user
// which where issued last month
//

const lastMonth = new Date()
lastMonth.setMonth(lastMonth.getMonth() - 1)

const userOrders = await indexBy(OrderOwner(someUser))
  .after(lastMonth)
  .reverse()
  .get(Order)
```

<br>

## API

_Coming soon(ish), but if you have TypeScript or a proper IDE, you should be able to deduce most functionality from above examples
and available functions._

<br>

## Contribution

Feedback and pull requests are more than welcome! Currently the main pressing issues are:

- [ ] Full API documentation
- [ ] Support for metadata

<br>

Here are some useful commands for contributing:

```bash
npm test          # runs all the tests
```
```bash
npm run cov:view  # checks the coverage status, try to avoid coverage regression!
```

<br><br>
