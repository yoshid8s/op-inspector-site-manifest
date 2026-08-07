import { Target } from "@originator-profile/model";
import { TargetIntegrityAlgorithm } from "@originator-profile/verify";
import { useMemo } from "react";
import { useSiteManifestElements } from "./site-manifest/use-site-manifest-elements";

/** CSS セレクター等で指定した要素を返すフック関数 */
function useElements(target: Target[]) {
  const normalElements = useMemo(
    () =>
      target
        .filter((content) => content.type !== "ExternalResourceTargetIntegrity")
        .flatMap((content) =>
          TargetIntegrityAlgorithm[content.type].elementSelector({
            ...content,
            document: window.parent.document,
          }),
        ),
    [target],
  );

  const { elements: manifestElements } = useSiteManifestElements(target);

  return {
    elements: [...normalElements, ...manifestElements],
  };
}

export default useElements;
