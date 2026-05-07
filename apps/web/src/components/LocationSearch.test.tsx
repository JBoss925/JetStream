import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocationSearch } from "./LocationSearch";

const charlotte = {
  id: "charlotte-nc",
  name: "Charlotte",
  region: "North Carolina",
  country: "United States",
  latitude: 35.2271,
  longitude: -80.8431,
  timezone: "America/New_York",
};

function okJson(payload: unknown) {
  return Promise.resolve({
    ok: true,
    json: async () => payload,
  } as Response);
}

describe("LocationSearch", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("searches locations and selects a result", async () => {
    const fetch = vi.fn((_url: URL | string) => okJson([charlotte]));
    const onSelectLocation = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const user = userEvent.setup();

    render(<LocationSearch onSelectLocation={onSelectLocation} />);

    await user.type(screen.getByRole("combobox", { name: "Location" }), "Cha");

    const option = await screen.findByRole("option", { name: /Charlotte/ });
    expect(String(fetch.mock.calls[0]?.[0])).toContain("name=Cha");

    await user.click(within(option).getByRole("button", { name: /Charlotte/ }));

    expect(onSelectLocation).toHaveBeenCalledWith(charlotte);
    expect(screen.getByRole("combobox", { name: "Location" })).toHaveValue(
      "Charlotte, North Carolina",
    );
    expect(screen.queryByRole("option", { name: /Charlotte/ })).not.toBeInTheDocument();
  });

  it("sends comma-separated city and region as structured search parameters", async () => {
    const user = userEvent.setup();
    const fetch = vi.fn((_url: URL | string) => okJson([charlotte]));
    vi.stubGlobal("fetch", fetch);

    render(<LocationSearch onSelectLocation={vi.fn()} />);

    await user.type(screen.getByRole("combobox", { name: "Location" }), "London, England");
    await screen.findByRole("option", { name: /Charlotte/ });

    const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1] as [URL | string];
    const requestUrl = String(lastCall[0]);
    expect(requestUrl).toContain("name=London");
    expect(requestUrl).toContain("region=England");
    expect(requestUrl).not.toContain("name=London%2C");
  });

  it("submits the active keyboard result", async () => {
    const fetch = vi.fn((_url: URL | string) =>
      okJson([
        charlotte,
        {
          ...charlotte,
          id: "charleston-sc",
          name: "Charleston",
          region: "South Carolina",
          latitude: 32.7765,
          longitude: -79.9311,
        },
      ]),
    );
    const onSelectLocation = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const user = userEvent.setup();

    render(<LocationSearch onSelectLocation={onSelectLocation} />);

    const input = screen.getByRole("combobox", { name: "Location" });
    await user.type(input, "Char");
    await screen.findByRole("option", { name: /Charlotte/ });
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelectLocation).toHaveBeenCalledWith(
      expect.objectContaining({ id: "charleston-sc", name: "Charleston" }),
    );
    expect(input).toHaveValue("Charleston, South Carolina");
  });

  it("shows a retryable search error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 502,
        json: async () => ({ message: "Search service failed" }),
      })),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const user = userEvent.setup();

    render(<LocationSearch onSelectLocation={vi.fn()} />);

    await user.type(screen.getByRole("combobox", { name: "Location" }), "Lo");

    await waitFor(() => {
      expect(screen.getByText("Search service failed")).toBeVisible();
    });
  });

  it("shows loading, empty results, and keeps keyboard navigation bounded", async () => {
    let resolveSearch: (value: Response) => void = () => undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveSearch = resolve;
          }),
      ),
    );
    const user = userEvent.setup();

    render(<LocationSearch onSelectLocation={vi.fn()} />);

    const input = screen.getByRole("combobox", { name: "Location" });
    await user.type(input, "No");

    expect(await screen.findByText("Searching locations...")).toBeVisible();

    resolveSearch({
      ok: true,
      json: async () => [],
    } as Response);

    expect(await screen.findByText("No matching locations yet.")).toBeVisible();

    await user.keyboard("{ArrowUp}{Enter}");
    expect(input).toHaveValue("No");
  });

  it("ignores aborted searches and handles non-Error rejections", async () => {
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
    const user = userEvent.setup();

    const { unmount } = render(<LocationSearch onSelectLocation={vi.fn()} />);
    await user.type(screen.getByRole("combobox", { name: "Location" }), "Ab");
    expect(await screen.findByText("Searching locations...")).toBeVisible();
    unmount();
    rejectFetch("aborted");

    vi.stubGlobal("fetch", vi.fn(() => Promise.reject("plain failure")));
    render(<LocationSearch onSelectLocation={vi.fn()} />);
    await user.type(screen.getByRole("combobox", { name: "Location" }), "Cd");

    expect(await screen.findByText("Unable to search locations.")).toBeVisible();
  });
});
