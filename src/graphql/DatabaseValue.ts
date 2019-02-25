import { GraphQLScalarType, Kind, ValueNode } from "graphql";

/**
 * A custom scalar GraphQL type describing a database value.
 */
export const DatabaseValue = new GraphQLScalarType({
  description:
    "The `DatabaseValue` scalar type represents a database value. The boolean values `true` and `false` are represented by 1 and 0, respectively. Only scalar values are accepted.",
  name: "DatabaseValue",

  /**
   * Parse a literal (value node).
   *
   * The following rules are used for parsing.
   *
   * 1. For integer nodes the node value is parsed as an integer.
   * 2. For float nodes the node value is parsed as a float.
   * 3. For string and enum nodes the node value is returned.
   * 4. Boolean nodes are parsed to 1 if the node value is true, and to 0
   *    otherwise.
   * 5. null nodes are parsed to null.
   * 6. Any other node type is rejected.
   *
   * Parameters:
   * -----------
   * ast:
   *     The value node to parse.
   *
   * Returns:
   * --------
   * The parsed value.
   */
  parseLiteral: (ast: ValueNode) => {
    switch (ast.kind) {
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.STRING:
      case Kind.ENUM:
        return ast.value;
      case Kind.BOOLEAN:
        return ast.value ? 1 : 0;
      case Kind.NULL:
        return null;
      default:
        throw new Error("DatabaseValue values must be scalar values.");
    }
  },

  /**
   * Parse a value.
   *
   * The same rules as for the parseLiteral method are used.
   *
   * Parameters:
   * -----------
   * value:
   *     The value to parse.
   *
   * Returns:
   * --------
   * The parsed value.
   */
  parseValue: (value: any) => {
    if (value === null) {
      return null;
    }

    switch (typeof value) {
      case "number":
      case "bigint":
      case "string":
      case "boolean":
        return value;
      default:
        throw new Error("DatabaseValue values must be scalar values.");
    }
  },

  /**
   * Serialize a value.
   *
   * Any value is just returned as is.
   *
   * Parameters:
   * -----------
   * value:
   *     The value to serialize.
   *
   * Returns:
   * --------
   * The serialized value (which is the original value).
   */
  serialize: (value: any) => {
    return value;
  }
});
