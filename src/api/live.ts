import type {
  Api,
  Category,
  DataStatus,
  FeaturedDeal,
  GeoPoint,
  Item,
  ItemDetail,
  NearbyStorePrice,
  PriceCheckInput,
  ScanResult,
  TrickInfo,
  Verdict,
} from "@shared/types";

async function apiFetch<T>(path: string, init?: RequestInit, timeoutMs = 15_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res: Response;
    try {
      res = await fetch(path, {
        ...init,
        signal: controller.signal,
      });
    } catch (err) {
      if (controller.signal.aborted) {
        const timeout = new Error("The server took too long to answer.");
        timeout.name = "TimeoutError";
        throw timeout;
      }
      throw err;
    }

    const body = (await res.json().catch(() => ({}))) as { error?: string } & T;

    if (!res.ok) {
      throw new Error(body.error ?? `Request failed with status ${res.status}`);
    }

    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

export const liveApi: Api = {
  async searchItems(q: string, category?: Category): Promise<Item[]> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<Item[]>(`/api/items${query}`);
  },

  async getItem(id: string): Promise<ItemDetail> {
    return apiFetch<ItemDetail>(`/api/items/${encodeURIComponent(id)}`);
  },

  async getFeatured(): Promise<FeaturedDeal[]> {
    return apiFetch<FeaturedDeal[]>("/api/featured");
  },

  async checkPrice(input: PriceCheckInput): Promise<Verdict> {
    return apiFetch<Verdict>("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  async scanImage(image: Blob | null, sampleId?: string): Promise<ScanResult> {
    const formData = new FormData();
    if (image) {
      formData.append("image", image, "scan.jpg");
    }
    if (sampleId) {
      formData.append("sampleId", sampleId);
    }

    return apiFetch<ScanResult>(
      "/api/scan",
      {
        method: "POST",
        body: formData,
      },
      // above the server's own 40s scan limit (server/scan.ts), so its specific error reaches the screen first
      45_000,
    );
  },

  async listTricks(): Promise<TrickInfo[]> {
    return apiFetch<TrickInfo[]>("/api/tricks");
  },

  async getDataStatus(): Promise<DataStatus> {
    return apiFetch<DataStatus>("/api/status");
  },

  async getNearbyPrices(itemId: string, near: GeoPoint, limit = 8): Promise<NearbyStorePrice[]> {
    const params = new URLSearchParams({
      lat: String(near.lat),
      lng: String(near.lng),
      limit: String(limit),
    });
    return apiFetch<NearbyStorePrice[]>(
      `/api/items/${encodeURIComponent(itemId)}/nearby?${params.toString()}`,
    );
  },
};