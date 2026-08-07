import { Target } from "@originator-profile/model";
import { TargetIntegrityAlgorithm } from "@originator-profile/verify";
import { useEffect, useState } from "react";
import { isSiteManifest } from "./types";

function normalizeUrl(value: string, baseUrl: string): string | null {
  try {
    const url = new URL(value, baseUrl);

    url.hash = "";

    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

function findLinkedElement(
  document: Document,
  itemUrl: string,
): HTMLElement | null {
  const expectedUrl = normalizeUrl(itemUrl, document.location.href);

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

export function useSiteManifestElements(targets: Target[]) {
  const [elements, setElements] = useState<HTMLElement[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const document = window.parent.document;

      const externalTargets = targets.filter(
        (target) => target.type === "ExternalResourceTargetIntegrity",
      );

      const manifestElements: HTMLElement[] = [];

      for (const target of externalTargets) {
        const resourceElements =
          TargetIntegrityAlgorithm[
            target.type
          ].elementSelector({
            ...target,
            document,
          });

        for (const resourceElement of resourceElements) {
          const element = resourceElement as HTMLElement & {
            src?: string;
            currentSrc?: string;
          };

          const src = element.currentSrc || element.src;

          if (!src) {
            continue;
          }

          try {
            const response = await fetch(src);

            if (!response.ok) {
              continue;
            }

            const payload = await response.json();

            if (!isSiteManifest(payload)) {
              continue;
            }

            for (const item of payload.items) {
              const linkedElement = findLinkedElement(
                document,
                item.url,
              );

              if (linkedElement) {
                manifestElements.push(linkedElement);
              }
            }
          } catch {
            // External resource may not be a Site Manifest JSON.
          }
        }
      }

      if (!cancelled) {
        setElements([...new Set(manifestElements)]);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [targets]);

  return { elements };
}
