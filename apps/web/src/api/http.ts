interface ErrorPayload {
  message?: string | string[];
  reason?: string;
}

export async function fetchJson<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  return (await response.json()) as T;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ErrorPayload;
    if (payload.reason) {
      return payload.reason;
    }

    if (Array.isArray(payload.message)) {
      return payload.message.join(" ");
    }

    if (payload.message) {
      return payload.message;
    }
  } catch {
    return `Weather request failed with status ${response.status}.`;
  }

  return "Weather request failed. Please try again.";
}
