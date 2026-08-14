export function normalizeUrl(
  value: string,
  baseUrl: string,
): string | null {
  try {
    const url = new URL(value, baseUrl);

    url.hash = "";

    if (
      url.pathname !== "/" &&
      url.pathname.endsWith("/")
    ) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function findLinkedElement(
  document: Document,
  targetUrl: string,
): HTMLElement | null {
  const expectedUrl = normalizeUrl(
    targetUrl,
    document.location.href,
  );

  if (!expectedUrl) {
    return null;
  }

  const anchors = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a[href]"),
  );

  const anchor = anchors.find((candidate) => {
    const candidateUrl = normalizeUrl(
      candidate.href,
      document.location.href,
    );

    return candidateUrl === expectedUrl;
  });

  if (!anchor) {
    return null;
  }

  return (
    anchor.closest<HTMLElement>("article") ??
    anchor.closest<HTMLElement>("li") ??
    anchor.closest<HTMLElement>("section") ??
    anchor
  );
}
