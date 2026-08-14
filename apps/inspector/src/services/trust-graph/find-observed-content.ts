import { normalizeUrl } from "./find-linked-element";

export type ObservedContent = {
  url: string;
  title: string;
};

function findPrimaryLink(
  container: Element,
): HTMLAnchorElement | null {
  return (
    container.querySelector<HTMLAnchorElement>(
      "h1 a[href], h2 a[href], h3 a[href], h4 a[href], h5 a[href], h6 a[href]",
    ) ??
    container.querySelector<HTMLAnchorElement>("a[href]")
  );
}

export function findObservedContent(
  document: Document,
): ObservedContent[] {
  const containers = Array.from(
    document.querySelectorAll<HTMLElement>(
      "article, [role='article']",
    ),
  );

  const results: ObservedContent[] = [];

  for (const container of containers) {
    const anchor = findPrimaryLink(container);

    if (!anchor) {
      continue;
    }

    const url = normalizeUrl(
      anchor.href,
      document.location.href,
    );

    if (!url) {
      continue;
    }

    const title =
      anchor.textContent?.trim() ||
      container.textContent?.trim() ||
      url;

    results.push({
      url,
      title,
    });
  }

  return [
    ...new Map(
      results.map((item) => [item.url, item]),
    ).values(),
  ];
}
