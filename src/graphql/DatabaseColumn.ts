import { GraphQLScalarType, Kind, StringValueNode, ValueNode } from "graphql";
import { hasOwnProperty } from "tslint/lib/utils";

function parseDatabaseColumnValue(value: string) {
  // Check whether the value contains whitespace or backticks
  if (/[\s`]/.test(value)) {
    throw new Error(
      "The DatabaseColumn value must not contain whitespace or backticks."
    );
  }

  // Parse the value into table and column
  const [table, column, ...rest] = value.split(".");

  // Check that both a table and a column are defined
  if (!table || !column) {
    throw new Error(
      'The DatabaseColumn value must be of the form "table.column."'
    );
  }

  // Check that there is only one dot in the value
  if (rest.length) {
    throw new Error("The DatabaseColumn value must contain exactly one dot.");
  }

  // Return the table and column as an object
  return { table, column };
}

export const DatabaseColumn = new GraphQLScalarType({
  description: "A database column in the form table.column.",
  name: "DatabaseColumn",

  /**
   * Parse a value node.
   *
   * The following rules are used for parsing.
   *
   * 0. null values are parsed into null.
   * 1. The value must be a string.
   * 2. The string must of the form table.column, where table and column are a
   *    table and column name, respectively.
   * 3. The table and column name must not be an empty string, and they must not
   *    contain whitespace, dots or backticks (`).
   * 4. The string is parsed into an object { table, column }.
   * 5. An error is thrown for invalid values.
   *
   * For example, the string 'A.B' is parsed into { table: 'A', column: 'B' }.
   *
   * Parameters:
   * -----------
   * ast:
   *     The value node to parse.
   *
   * Returns:
   * --------
   * An object with the table and column name.
   */
  parseLiteral: (ast: ValueNode) => {
    switch (ast.kind) {
      case Kind.NULL:
        return null;
      case Kind.STRING:
        return parseDatabaseColumnValue((ast as StringValueNode).value);
      default:
        throw new Error("DatabaseColumn values must be string values.");
    }
  },

  /**
   * Parse a value.
   *
   * The same rules as for the parseLiteral function apply.
   *
   * Parameters:
   * -----------
   * value:
   *     The value to parse.
   *
   * Returns:
   * --------
   * An object with the table and column name.
   */
  parseValue: (value: any) => {
    if (value === null) {
      return null;
    }
    if (typeof value !== "string") {
      throw new Error("DatabaseColumn values must be string values.");
    }
    return parseDatabaseColumnValue(`${value}`);
  },

  /**
   * Serialize a value.
   *
   * The following rules are used for serializing.
   *
   * 0. null values are serialized to null.
   * 1. The value to serialize must be an object with a table and a column
   *    property, which contain the table and the column name.
   * 2. The table and column name must be non-empty strings with no whitespace,
   *    dots or backticks (`).
   * 3. Thr table and column amed `are joined with a dot.
   * 4. A null value is serialized to null.
   * 5. An error is thrown for invalid values.
   *
   * For example, the object { table: 'A', column: 'N' } is serialized to 'A.B'.
   *
   * Parameters:
   * -----------
   * value:
   *     The value to serialize.
   *
   * Returns:
   * --------
   * A string of the form target.column.
   */
  serialize: (value: any) => {
    // Handle null value
    if (value === null) {
      return null;
    }
    // Only objects can be serialized
    if (typeof value !== "object") {
      throw new Error(
        "The value to serialize must be an object with a table and a column property."
      );
    }

    // Objects need a table and a column property
    if (!hasOwnProperty(value, "table") || !hasOwnProperty(value, "column")) {
      throw new Error(
        "The object to serialize must have a table and a column property."
      );
    }

    // Both the table and the column property must have a string value
    const table = value.table;
    const column = value.column;
    if (typeof table !== "string") {
      throw new Error("The table property must have a string value.");
    }
    if (typeof column !== "string") {
      throw new Error("The column property must have a string value.");
    }

    // Empty strings are forbidden for the table and column name
    if (table === "") {
      throw new Error(
        "The table property must not have an empty string value."
      );
    }
    if (column === "") {
      throw new Error(
        "The column property must not have an empty string value."
      );
    }

    // Whitespace, dots and backicks are forbidden for the table and column name
    const forbiddenCharacters = /[\s.`]/;
    if (forbiddenCharacters.test(table)) {
      throw new Error(
        "The value of the table property must not contain whitespace, dots or backticks."
      );
    }
    if (forbiddenCharacters.test(column)) {
      throw new Error(
        "The value of the column property must not contain whitespace, dots or backticks."
      );
    }

    // Serialize the object
    return `${table}.${column}`;
  }
});
