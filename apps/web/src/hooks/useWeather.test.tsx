import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LocationOption, Units } from "@jetstream-weather/domain";
import { useWeather } from "./useWeather";

const location: LocationOption = {
  id: "charlotte-nc",
  name: "Charlotte",
  region: "North Carolina",
  country: "United States",
  latitude: 35.2271,
  longitude: -80.8431,
  timezone: "America/New_York",
};

function HookHarness({
  enabled = true,
  currentLocation = location,
  units = "imperial",
}: {
  enabled?: boolean;
  currentLocation?: LocationOption | null;
  units?: Units;
}) {
  const state = useWeather(currentLocation, units, enabled);

  return (
    <div>
      <span>{state.isLoading ? "loading" : "settled"}</span>
      <span>{state.data?.location.name ?? "no-data"}</span>
      <span>{state.error ?? "no-error"}</span>
    </div>
  );
}

describe("useWeather", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("clears state while disabled", () => {
    render(<HookHarness enabled={false} />);

    expect(screen.getByText("settled")).toBeVisible();
    expect(screen.getByText("no-data")).toBeVisible();
    expect(screen.getByText("no-error")).toBeVisible();
  });

  it("surfaces weather loading errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({ message: "Weather request failed" }),
      })),
    );

    render(<HookHarness />);

    await waitFor(() => {
      expect(screen.getByText("Weather request failed")).toBeVisible();
    });
    expect(screen.getByText("no-data")).toBeVisible();
  });

  it("ignores aborted requests and handles non-Error rejections", async () => {
    let rejectFetch: (reason: unknown) => void = () => undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: URL | string, init?: RequestInit) => {
        init?.signal?.addEventListener("abort", () => rejectFetch("aborted"));
        return new Promise<Response>((_resolve, reject) => {
          rejectFetch = reject;
        });
      }),
    );

    const { unmount } = render(<HookHarness />);
    unmount();
    rejectFetch("aborted");

    vi.stubGlobal("fetch", vi.fn(() => Promise.reject("plain failure")));

    render(<HookHarness currentLocation={{ ...location, id: "retry" }} />);

    await waitFor(() => {
      expect(screen.getByText("Unable to load weather data.")).toBeVisible();
    });
  });
});
