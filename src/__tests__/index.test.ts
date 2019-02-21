import { StringValueNode, ValueNode } from "graphql";
import { DatabaseColumn } from "../index";

describe("DatabaseColumn", () => {
  describe("parseLiteral", () => {
    // Wrap strings in a StringNodeValue
    const s: (value: string) => StringValueNode = (value: string) => ({
      kind: "StringValue",
      value
    });

    it("should reject literals which are not a string", () => {
      const args: ValueNode[] = [
        { kind: "IntValue", value: "0" },
        { kind: "IntValue", value: "7" },
        { kind: "FloatValue", value: "-6.45" },
        { kind: "BooleanValue", value: true },
        { kind: "BooleanValue", value: false },
        { kind: "ListValue", values: [{ kind: "StringValue", value: "A.B" }] }
      ];

      for (let arg of args) {
        const f = () => DatabaseColumn.parseLiteral(arg, null);
        expect(f).toThrow("must be string");
      }
    });

    it("should reject string literals not defining both table and column", () => {
      const args = ["ABC", ".B", "A."];

      for (let arg of args) {
        const f = () => DatabaseColumn.parseLiteral(s(arg), null);
        expect(f).toThrow("table.column");
      }
    });

    it("should reject string literals with more than one dot", () => {
      const f = () => DatabaseColumn.parseLiteral(s("A.B.C"), null);
      expect(f).toThrow("contain exactly one dot");
    });

    it("should reject string literals with whitespace", () => {
      const args = ['" A.B"', '"A B.C"', '"A. B"', '"A.B "', "A\t.B", "A.B\n"];

      for (let arg of args) {
        const f = () => DatabaseColumn.parseLiteral(s(arg), null);
        expect(f).toThrow("must not contain whitespace or backticks");
      }
    });

    it("should reject string literals with backticks", () => {
      const args = ['"`A.B"', '"`A`.`B`"', '"A.B`b"'];

      for (let arg of args) {
        const f = () => DatabaseColumn.parseLiteral(s(arg), null);
        expect(f).toThrow("must not contain whitespace or backticks");
      }
    });

    it("should handle null values", () => {
      expect(
        DatabaseColumn.parseLiteral({ kind: "NullValue" }, null)
      ).toBeNull();
    });

    it("should parse valid string literals into the correct object", () => {
      expect(DatabaseColumn.parseLiteral(s("A.B"), null)).toEqual({
        table: "A",
        column: "B"
      });
      expect(DatabaseColumn.parseLiteral(s("Aaa.Bbb"), null)).toEqual({
        table: "Aaa",
        column: "Bbb"
      });
      expect(DatabaseColumn.parseLiteral(s("A23.Bbb"), null)).toEqual({
        table: "A23",
        column: "Bbb"
      });
      expect(DatabaseColumn.parseLiteral(s("42.67"), null)).toEqual({
        table: "42",
        column: "67"
      });
    });
  });

  describe("parseValue", () => {
    it("should reject values which are not a string", () => {
      const args = [0, 7, -6.45, true, false, ["A.B"], undefined];

      for (let arg of args) {
        const f = () => DatabaseColumn.parseValue(arg);
        expect(f).toThrow("must be string");
      }
    });

    it("should reject string values not defining both table and column", () => {
      const args = ["ABC", ".B", "A."];

      for (let arg of args) {
        const f = () => DatabaseColumn.parseValue(arg);
        expect(f).toThrow("table.column");
      }
    });

    it("should reject string values with more than one dot", () => {
      const f = () => DatabaseColumn.parseValue("A.B.C");
      expect(f).toThrow("contain exactly one dot");
    });

    it("should reject string values with whitespace", () => {
      const args = [" A.B", "A B.C", "A. B", "A.B ", "A\t.B", "A.B\n"];

      for (let arg of args) {
        const f = () => DatabaseColumn.parseValue(arg);
        expect(f).toThrow("must not contain whitespace or backticks");
      }
    });

    it("should reject string values with backticks", () => {
      const args = ['"`A.B"', '"`A`.`B`"', '"A.B`b"'];

      for (let arg of args) {
        const f = () => DatabaseColumn.parseValue(arg);
        expect(f).toThrow("must not contain whitespace or backticks");
      }
    });

    it("should handle null values", () => {
      expect(DatabaseColumn.parseValue(null)).toBeNull();
    });

    it("should parse valid string values into the correct object", () => {
      expect(DatabaseColumn.parseValue("A.B")).toEqual({
        table: "A",
        column: "B"
      });
      expect(DatabaseColumn.parseValue("Aaa.Bbb")).toEqual({
        table: "Aaa",
        column: "Bbb"
      });
      expect(DatabaseColumn.parseValue("A23.Bbb")).toEqual({
        table: "A23",
        column: "Bbb"
      });
      expect(DatabaseColumn.parseValue("42.67")).toEqual({
        table: "42",
        column: "67"
      });
    });
  });

  describe("serialize", () => {
    it("should reject values which are not an object", () => {
      const args = [0, 4, -6.94, "{}", true, false, undefined];

      for (let arg of args) {
        const f = () => DatabaseColumn.serialize(arg);
        expect(f).toThrow("must be an object");
      }
    });

    it("should reject objects which are lacking a table or column property", () => {
      const args = [{}, { a: "A", b: "B" }, { table: "A" }, { column: "B" }];

      for (let arg of args) {
        const f = () => DatabaseColumn.serialize(arg);
        expect(f).toThrow("must have a table and a column property");
      }
    });

    it("should reject objects whose table or column property do not have a string value", () => {
      const args = [0, -5, 56.9, true, false, {}, null, undefined];

      for (let arg of args) {
        let f = () => DatabaseColumn.serialize({ table: arg, column: "B" });
        expect(f).toThrow("must have a string value");

        f = () => DatabaseColumn.serialize({ table: "A", column: arg });
        expect(f).toThrow("must have a string value");
      }
    });

    it("should reject objects whose table or column property have an empty string as their value", () => {
      let f = () => DatabaseColumn.serialize({ table: "", column: "B" });
      expect(f).toThrow("must not have an empty string");

      f = () => DatabaseColumn.serialize({ table: "A", column: "" });
      expect(f).toThrow("must not have an empty string");
    });

    it("should reject objects whose table or column property have string values containing whitespace, dots or backticks", () => {
      const args = [
        " A",
        "A ",
        "A a",
        "A\n",
        "A\ta",
        ".A",
        "A.",
        "A.a",
        "`A",
        "A`",
        "A`a",
        "`A`"
      ];

      for (let arg of args) {
        let f = () => DatabaseColumn.serialize({ table: arg, column: "B" });
        expect(f).toThrow("must not contain whitespace, dots or backticks");

        f = () => DatabaseColumn.serialize({ table: "A", column: arg });
        expect(f).toThrow("must not contain whitespace, dots or backticks");
      }
    });

    it("should handle null values", () => {
      expect(DatabaseColumn.serialize(null)).toBeNull();
    });

    it("should correctly serialize valid objects", () => {
      expect(DatabaseColumn.serialize({ table: "A", column: "B" })).toEqual(
        "A.B"
      );
      expect(
        DatabaseColumn.serialize({ table: "A", column: "B", other: "C" })
      ).toEqual("A.B");
      expect(DatabaseColumn.serialize({ table: "Aaa", column: "Bbb" })).toEqual(
        "Aaa.Bbb"
      );
      expect(DatabaseColumn.serialize({ table: "A23", column: "Bbb" })).toEqual(
        "A23.Bbb"
      );
      expect(DatabaseColumn.serialize({ table: "42", column: "65" })).toEqual(
        "42.65"
      );
    });
  });
});
