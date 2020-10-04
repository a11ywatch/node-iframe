import { configureResourceControl, appSourceConfig } from "@app/iframe";

describe("resource handling", () => {
  test("can configure app resource options", () => {
    configureResourceControl({ inline: { script: true } });

    expect(appSourceConfig.inline.script).toBe(true);
  });
});
