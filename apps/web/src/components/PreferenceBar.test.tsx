import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PreferenceBar } from "./PreferenceBar";
import { testWeatherScenarios } from "../testWeatherScenarios";

function renderPreferenceBar(overrides = {}) {
  const props = {
    units: "imperial" as const,
    theme: "dark" as const,
    colorTheme: "cyan" as const,
    backendMode: "live" as const,
    testScenarios: testWeatherScenarios.slice(0, 2),
    selectedTestScenarioId: testWeatherScenarios[0].id,
    onUnitsChange: vi.fn(),
    onThemeChange: vi.fn(),
    onColorThemeChange: vi.fn(),
    onSaveDefaultLocation: vi.fn(),
    onBackendModeChange: vi.fn(),
    onTestScenarioChange: vi.fn(),
    isCurrentLocationDefault: false,
    ...overrides,
  };

  render(<PreferenceBar {...props} />);
  return props;
}

describe("PreferenceBar", () => {
  it("updates mode, units, theme, and saved default preferences", async () => {
    const props = renderPreferenceBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Test" }));
    await user.click(screen.getByRole("button", { name: "F" }));
    await user.click(screen.getByRole("button", { name: "C" }));
    await user.click(screen.getByRole("button", { name: "Switch to light theme" }));
    await user.click(
      screen.getByRole("button", { name: "Save current location as default" }),
    );

    expect(props.onBackendModeChange).toHaveBeenCalledWith("test");
    expect(props.onUnitsChange).toHaveBeenCalledWith("metric");
    expect(props.onThemeChange).toHaveBeenCalledWith("light");
    expect(props.onSaveDefaultLocation).toHaveBeenCalled();
  });

  it("renders scenario and palette controls", async () => {
    const props = renderPreferenceBar({
      backendMode: "test",
      theme: "light",
      isCurrentLocationDefault: true,
    });
    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByLabelText("Scenario"),
      testWeatherScenarios[1].id,
    );
    await user.click(screen.getByRole("button", { name: "Choose color theme" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Rose" }));

    expect(props.onTestScenarioChange).toHaveBeenCalledWith(testWeatherScenarios[1].id);
    expect(props.onColorThemeChange).toHaveBeenCalledWith("rose");
    expect(screen.queryByRole("menu", { name: "Color theme" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Current location is your default" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("can close the palette without choosing and switch back to live/dark", async () => {
    const props = renderPreferenceBar({
      backendMode: "test",
      theme: "light",
      colorTheme: "unknown",
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Choose color theme" }));
    expect(screen.getByRole("menu", { name: "Color theme" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Choose color theme" }));
    expect(screen.queryByRole("menu", { name: "Color theme" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Live" }));
    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));

    expect(props.onBackendModeChange).toHaveBeenCalledWith("live");
    expect(props.onThemeChange).toHaveBeenCalledWith("dark");
  });
});
