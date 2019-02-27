# graphql-type-mysql
Custom scalar GraphQL types for MySQL.

# Installation

The package can be installed with npm.

```bash
npm install --save graphql-type-mysql
```

Alternatively you may use yarn.

```bash
yarn add graphql-type-mysql
```

## Usage

The package provides two custom scalar types for GraphQL, `DatabaseColumn` and `DatabaseValue`.

### DatabaseColumn

MySQL column names are of the form *table*.*column*. The `DatabaseColumn` represents such column names and represents them with an object having a `table` and a `column` property. For example, the column name

```
MyImportantTable.MyEquallyImportantColumn
```

is represented by the object

```
{
  table: 'MyImportantTable',
  column: 'MyEquallyImportantColumn'
}
```

Neither the table nor the column name must contain whitespace, dots or backticks. In particular, the table and column name must *not* be enclosed in backticks.

### DatabaseValue

The `DatabaseValue` mostly is a union of the various built-in scalar types. The one exception is that boolean values are represented by integers. `true` is represented by 1, `false` by 0. The converse is not true; 0 and 1 are not serialized to boolean values.

The behaviour regarding booleans allows you to safely pass booleans that are represented by 0 and 1 in the database.

A `DatabaseValue` value must not be an object type.

# Using the types

You can use the types in the same way you would use any other custom scalar. Here is a simple example illustrating how you could include them in a GraphQL server.

```javascript
const { DatabaseColumn, DatabaseValue } = require("graphql-type-mysql");
const { GraphQLServer } = require("graphql-yoga");

const typeDefs = `

scalar DatabaseColumn
scalar DatabaseValue

type SearchParameters {
  tableName: String
  columnName: String
  column: DatabaseColumn
  value: DatabaseValue
}

type Query {
  search(column: DatabaseColumn, value: DatabaseValue): SearchParameters
}
`;

const resolvers = {
  Query: {
    search(root, { column, value }) {
      return {
        column,
        value
      };
    }
  },
  SearchParameters: {
    tableName(search) {
      return search.column.table;
    },

    columnName(search) {
      return search.column.column;
    }
  },
  DatabaseColumn,
  DatabaseValue
};

const server = new GraphQLServer({ typeDefs, resolvers });

server
  .start({ port: 4000 })
  .then(() => console.log("Server running on http://localhost:4000/"));
```

Two aspects are worth noting.

1. You need to declare the custom types in the schema.

```graphql
scalar DatabaseColumn
scalar DatabaseValue
```

2. You need to include the custom types in the resolvers map.

```javascript
const resolvers = {
  // ...
  DatabaseColumn, 
  DatabaseValue
}
```

In order to run the example code, you need GraphQl-Yoga, which can be installed with npm,

```bash
npm install --save graphql-yoga
```

or with yarn,

```bash
yarn add graphql-yoga
```

As an example, consider the following GraphQL query.

```graphql
query {
  search(column: "A.B", value: true) {
    tableName,
    columnName,
    column,
    value
  }
}
```

If you send this query to the example server, the following data is returned.

```json
{
  "data": {
    "search": {
      "tableName": "A",
      "columnName": "B",
      "column": "A.B",
      "value": 1
    }
  }
}
```

If you want to learn more about custom scalar types in GraphQL, have a look at https://encoded.io/graphql-custom-scalars/ and https://www.apollographql.com/docs/graphql-tools/scalars.html.

## TypeScript support

The package ships with type definitions, so that you can use it with TypeScript out of the box.
