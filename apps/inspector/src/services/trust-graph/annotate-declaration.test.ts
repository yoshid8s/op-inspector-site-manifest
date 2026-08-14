// @vitest-environment happy-dom

import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { TrustNode } from "../../models/trust-node";
import { annotateDeclaration } from "./annotate-declaration";

function createDocument(
  html: string,
  url = "https://example.com/",
): Document {
  const window = new Window({ url });
  window.document.write(html);
  return window.document;
}

function createRoot(): TrustNode {
  return {
    id: "manifest:https://example.com/",
    type: "manifest",
    title: "Site Manifest",
    children: [
      {
        id: "section:featured",
        type: "section",
        title: "featured",
        children: [
          {
            id: "article:https://example.com/articles/declared",
            type: "article",
            title: "Declared article",
            url: "https://example.com/articles/declared",
            presence: "present",
          },
        ],
      },
    ],
  };
}

describe("annotateDeclaration", () => {
  it("marks manifest article nodes as declared", () => {
    const document = createDocument(`
      <html>
        <body>
          <article>
            <h2>
              <a href="/articles/declared">Declared article</a>
            </h2>
          </article>
        </body>
      </html>
    `);

    const result = annotateDeclaration(
      document,
      createRoot(),
    );

    const declared =
      result.children?.[0]?.children?.[0];

    expect(declared?.declaration).toBe("declared");
  });

  it("adds observed articles that are not declared in the manifest", () => {
    const document = createDocument(`
      <html>
        <body>
          <article>
            <h2>
              <a href="/articles/declared">Declared article</a>
            </h2>
          </article>

          <article>
            <h2>
              <a href="/articles/undeclared">Undeclared article</a>
            </h2>
          </article>
        </body>
      </html>
    `);

    const result = annotateDeclaration(
      document,
      createRoot(),
    );

    const undeclaredSection =
      result.children?.find(
        (node) => node.id === "section:undeclared",
      );

    expect(undeclaredSection).toBeDefined();
    expect(undeclaredSection?.children).toHaveLength(1);

    expect(undeclaredSection?.children?.[0]).toMatchObject({
      type: "article",
      title: "Undeclared article",
      url: "https://example.com/articles/undeclared",
      declaration: "undeclared",
      presence: "present",
    });
  });

  it("deduplicates observed content with the same URL", () => {
    const document = createDocument(`
      <html>
        <body>
          <article>
            <h2>
              <a href="/articles/undeclared">Undeclared article</a>
            </h2>
          </article>

          <article>
            <h2>
              <a href="/articles/undeclared">Undeclared article duplicate</a>
            </h2>
          </article>
        </body>
      </html>
    `);

    const result = annotateDeclaration(
      document,
      createRoot(),
    );

    const undeclaredSection =
      result.children?.find(
        (node) => node.id === "section:undeclared",
      );

    expect(undeclaredSection?.children).toHaveLength(1);
  });
});
