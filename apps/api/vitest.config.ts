import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/main.ts",
        "src/modules/app.module.ts",
        "src/**/*.dto.ts",
        "src/**/*.test.ts",
      ],
      thresholds: {
        statements: 100,
        lines: 100,
        functions: 100,
        branches: 80,
      },
    },
  },
});
