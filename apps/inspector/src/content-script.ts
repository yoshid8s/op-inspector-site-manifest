import { serializeIfError } from "@originator-profile/core";
import { fetchSiteProfile } from "@originator-profile/presentation";
import { type FrameVerifiedCas } from "./components/credentials";
import {
  frameCasExtensionMessenger,
  frameCasWindowMessenger,
} from "./components/frameCas";
import {
  Overlay,
  OverlayProtocolMap,
  overlayWindowMessenger,
} from "./components/overlay";
import { overlayExtensionMessenger } from "./components/overlay/extension-events";
import { siteProfileMessenger } from "./components/siteProfile";

import { TargetIntegrityAlgorithm } from "@originator-profile/verify";
import { trustTreeMessenger } from "./components/trust-tree";
import { resolveSiteManifest } from "./services/external-resource/site-manifest-resolver";

const overlay = new Overlay();
let enter: Parameters<OverlayProtocolMap["enter"]>[0] = {
  framesCas: [],
  activeCa: null,
  wmps: [],
};

overlayExtensionMessenger.onMessage("enter", ({ data }) => {
  overlay.activate();
  enter = data;
  overlayWindowMessenger.sendMessage("enter", data, overlay.window);
});

overlayExtensionMessenger.onMessage("leave", ({ data }) => {
  overlayWindowMessenger.sendMessage("leave", data, overlay.window);
});

overlayWindowMessenger.onMessage("enter", () => {
  overlayWindowMessenger.sendMessage("enter", enter, overlay.window);
});

overlayWindowMessenger.onMessage("leave", () => {
  overlay.deactivate();
});

overlayWindowMessenger.onMessage("select", ({ data }) => {
  void overlayExtensionMessenger.sendMessage("select", data);
});

siteProfileMessenger.onMessage("fetchSiteProfile", async () => {
  const data = await fetchSiteProfile(document);
  return serializeIfError(data);
});

let tabId: number;
let framesCas: FrameVerifiedCas[] = [];

frameCasExtensionMessenger.onMessage("prepareLocate", ({ data }) => {
  tabId = data.tabId;
  framesCas = data.framesCas;
});

frameCasWindowMessenger.onMessage("located", ({ data }) => {
  frameCasWindowMessenger.sendMessage("located", data, overlay.window);
});

frameCasWindowMessenger.onMessage("startLocate", () => {
  void frameCasExtensionMessenger.sendMessage("prepareLocate", {
    tabId,
    framesCas,
  });
});

trustTreeMessenger.onMessage("resolveSiteTrustGraph", async ({ data }) => {
  const externalTargets = data.targets.filter(
    (target) => target.type === "ExternalResourceTargetIntegrity",
  );

  for (const target of externalTargets) {
    const resourceElements = TargetIntegrityAlgorithm[
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
        const resolved = await resolveSiteManifest(src);

        if (resolved) {
          return resolved.root;
        }
      } catch {
        // The external resource may not be a Site Manifest.
      }
    }
  }

  return null;
});

trustTreeMessenger.onMessage("focusTrustNode", ({ data }) => {
  const element = findTrustNodeElement(document, data.url);

  if (!element) {
    return false;
  }

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  return true;
});

function normalizeTrustUrl(value: string, baseUrl: string): string | null {
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

function findTrustNodeElement(
  document: Document,
  targetUrl: string,
): HTMLElement | null {
  const expected = normalizeTrustUrl(targetUrl, document.location.href);

  if (!expected) {
    return null;
  }

  const anchors = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a[href]"),
  );

  const anchor = anchors.find((candidate) => {
    const candidateUrl = normalizeTrustUrl(
      candidate.href,
      document.location.href,
    );

    return candidateUrl === expected;
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

trustTreeMessenger.onMessage("focusTrustNode", ({ data }) => {
  const element = findTrustNodeElement(document, data.url);

  if (!element) {
    return false;
  }

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  return true;
});
