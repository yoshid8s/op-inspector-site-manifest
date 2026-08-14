// @vitest-environment happy-dom

import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { TrustNode } from "../../models/trust-node";
import { annotatePresence } from "./annotate-presence";

function createDocument(html: string, url = "https://example.com/"): Document {
  const window = new Window({ url });

  window.document.write(html);

  return window.document;
}

describe("annotatePresence", () => {
  it("marks an article as present when its link exists in the document", () => {
    const document = createDocument(`
      <html>
        <head>
          <base href="https://example.com/" />
        </head>
        <body>
          <article>
            <a href="/articles/example">Example article</a>
          </article>
        </body>
      </html>
    `);

    const root: TrustNode = {
      id: "manifest:https://example.com/",
      type: "manifest",
      title: "Site Manifest",
      children: [
        {
          id: "article:https://example.com/articles/example",
          type: "article",
          title: "Example article",
          url: "https://example.com/articles/example",
        },
      ],
    };

    const result = annotatePresence(document, root);

    expect(result.presence).toBe("unknown");
    expect(result.children?.[0]?.presence).toBe("present");
  });

  it("marks an article as missing when its link does not exist", () => {
    const document = createDocument(`
      <html>
        <body>
          <article>
            <a href="/articles/example">Example article</a>
          </article>
        </body>
      </html>
    `);

    const root: TrustNode = {
      id: "manifest:https://example.com/",
      type: "manifest",
      title: "Site Manifest",
      children: [
        {
          id: "article:https://example.com/articles/missing",
          type: "article",
          title: "Missing article",
          url: "https://example.com/articles/missing",
        },
      ],
    };

    const result = annotatePresence(document, root);

    expect(result.children?.[0]?.presence).toBe("missing");
  });

  it("keeps non-article nodes unknown", () => {
    const document = createDocument("<html><body></body></html>");

    const root: TrustNode = {
      id: "manifest:https://example.com/",
      type: "manifest",
      title: "Site Manifest",
      children: [
        {
          id: "section:featured",
          type: "section",
          title: "featured",
        },
      ],
    };

    const result = annotatePresence(document, root);

    expect(result.presence).toBe("unknown");
    expect(result.children?.[0]?.presence).toBe("unknown");
  });
});
