import { Kind } from "graphql";
import { DatabaseValue } from "..";

describe("DatabaseValue", () => {
  describe("parseLiteral", () => {
    it("should parse integer nodes to an integer", () => {
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.INT, value: "0" }, null)
      ).toBe(0);
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.INT, value: "1589" }, null)
      ).toBe(1589);
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.INT, value: "-7" }, null)
      ).toBe(-7);
    });

    it("should parse float nodes to a float", () => {
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.FLOAT, value: "0" }, null)
      ).toBeCloseTo(0);
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.FLOAT, value: "78.745" }, null)
      ).toBeCloseTo(78.745);
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.FLOAT, value: "-111.99" }, null)
      ).toBeCloseTo(-111.99);
    });

    it("should parse string and enum nodes to the node value", () => {
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.STRING, value: "Tomato" }, null)
      ).toEqual("Tomato");
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.ENUM, value: "RED" }, null)
      ).toEqual("RED");
    });

    it("should parse boolean nodes to 1 (for true) or 0 (otherwise)", () => {
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.BOOLEAN, value: true }, null)
      ).toEqual(1);
      expect(
        DatabaseValue.parseLiteral({ kind: Kind.BOOLEAN, value: false }, null)
      ).toEqual(0);
    });

    it("should parse null nodes to null", () => {
      expect(DatabaseValue.parseLiteral({ kind: Kind.NULL }, null)).toBeNull();
    });

    it("should reject any other node type", () => {
      let f = () =>
        DatabaseValue.parseLiteral({ kind: Kind.LIST, values: [] }, null);
      expect(f).toThrow("must be scalar");
    });
  });

  describe("parseValue", () => {
    it("should parse integer values to an integer", () => {
      expect(DatabaseValue.parseValue(0)).toBe(0);
      expect(DatabaseValue.parseValue(1589)).toBe(1589);
      expect(DatabaseValue.parseValue(-7)).toBe(-7);
    });

    it("should parse float values as a float", () => {
      expect(DatabaseValue.parseValue(0)).toBeCloseTo(0);
      expect(DatabaseValue.parseValue(78.745)).toBeCloseTo(78.745);
      expect(DatabaseValue.parseValue(-111.99)).toBeCloseTo(-111.99);
    });

    it("should parse string values as strings", () => {
      expect(DatabaseValue.parseValue("Tomato")).toEqual("Tomato");
    });

    it("should parse boolean values as booleans", () => {
      expect(DatabaseValue.parseValue(true)).toBe(true);
      expect(DatabaseValue.parseValue(false)).toBe(false);
    });

    it("should parse null values as null", () => {
      expect(DatabaseValue.parseValue(null)).toBeNull();
    });

    it("should reject object values", () => {
      let f = () => DatabaseValue.parseValue({});
      expect(f).toThrow("must be scalar");

      f = () => DatabaseValue.parseValue([45]);
      expect(f).toThrow("must be scalar");
    });
  });

  describe("serialize", () => {
    const values = [
      0,
      1589,
      -7,
      78.745,
      -111.99,
      "Tomato",
      true,
      false,
      null,
      {},
      { a: "A" },
      [98]
    ];

    for (let value of values) {
      expect(DatabaseValue.serialize(value)).toEqual(value);
    }
  });
});
