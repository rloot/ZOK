import { assert } from "chai";
import { randomFill, randomInt } from "crypto";
import { pack } from "../src/codegen/properties";

// const uint = (n: number) => 2 ** n - 1;
const uint = (n: number) => n;

describe("property casess ", () => {
  it("pack variables", () => {
    const cases = [
      [uint(1), uint(16), uint(32), uint(64), uint(256)],
      [uint(1), uint(16), uint(32), uint(64), uint(256)],
      [uint(32), uint(64), uint(64), uint(32), uint(64), uint(64)],
      [uint(32), uint(64), uint(64), uint(64), uint(32), uint(64), uint(64)],
      [uint(32), uint(64), uint(64), uint(64), uint(64), uint(32), uint(64)],
      [uint(256), uint(256), uint(256)],
      [uint(256), uint(64), uint(64), uint(64), uint(64)],
      [uint(16), uint(256), uint(1)],
    ];
    for (const c of cases) {
      const result = pack(c.map((bits) => [randomInt(65000).toString(), bits]));
      result.every(
        (sizes) => sizes.reduce((sum, [name, bits]) => sum + bits, 0) <= 256
      );
    }
  });
});
