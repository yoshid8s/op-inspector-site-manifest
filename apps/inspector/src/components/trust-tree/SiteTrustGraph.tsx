import { Target } from "@originator-profile/model";
import { useEffect, useState } from "react";
import { TrustNode } from "../../models/trust-node";
import { trustTreeMessenger } from "./events";
import { TrustTree } from "./TrustTree";

type Props = {
  tabId: number;
  targets: Target[];
};

export function SiteTrustGraph({
  tabId,
  targets,
}: Props) {
  const [root, setRoot] =
    useState<TrustNode | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const resolved =
          await trustTreeMessenger.sendMessage(
            "resolveSiteTrustGraph",
            { targets },
            tabId,
          );

        if (!cancelled) {
          setRoot(resolved);
        }
      } catch {
        if (!cancelled) {
          setRoot(null);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tabId, targets]);

  if (!root) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <TrustTree root={root} />
    </div>
  );
}
