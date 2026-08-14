import { Target } from "@originator-profile/model";
import { defineExtensionMessaging } from "@webext-core/messaging";
import { TrustNode } from "../../models/trust-node";

type TrustTreeProtocolMap = {
  resolveSiteTrustGraph(message: {
    targets: Target[];
  }): TrustNode | null;
};

export const trustTreeMessenger =
  defineExtensionMessaging<TrustTreeProtocolMap>();
