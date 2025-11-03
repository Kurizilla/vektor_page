export type ServiceItem = {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
};

export type CaseItem = {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  description?: string;
  technologies?: string[] | Array<{ name: string; slug?: string }>;
};

type StrapiCollectionResponse<T> = {
  data: T[];
};

type StrapiSingleResponse<T> = { data: (T & { id: number; documentId?: string }) | null };

const CMS_URL =
  process.env.CMS_INTERNAL_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';

async function strapiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${CMS_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>)
  };
  // Use API Token if provided (avoids needing public permissions)
  if (process.env.STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers,
        // Cache with ISR in App Router
        next: { revalidate: 300 }
      });
      if (res.ok) {
        return (await res.json()) as T;
      }
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${text}`);
    } catch (err) {
      lastError = err;
      // Backoff (250ms, 500ms, 1000ms, 1500ms)
      const delay = 250 * (attempt + 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`Strapi fetch failed for ${path}: ${String(lastError)}`);
}

export async function getServices(locale?: string): Promise<ServiceItem[]> {
  const qp = locale ? `&locale=${encodeURIComponent(locale)}` : '';
  const json = await strapiFetch<StrapiCollectionResponse<ServiceItem>>(
    `/api/services?sort=title:asc${qp}`
  );
  return json.data || [];
}

export async function getCases(locale?: string): Promise<CaseItem[]> {
  const qp = locale ? `&locale=${encodeURIComponent(locale)}` : '';
  const json = await strapiFetch<StrapiCollectionResponse<CaseItem>>(
    `/api/cases?sort=title:asc${qp}`
  );
  return json.data || [];
}

export type SiteSettings = {
  siteName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export async function getSiteSettings(locale?: string): Promise<SiteSettings | null> {
  const qp = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  const json = await strapiFetch<StrapiSingleResponse<SiteSettings>>(
    `/api/site-setting${qp}`
  );
  return json.data ?? null;
}


