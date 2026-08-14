# Site Trust Graph Design

## 1. 目的

本プロトタイプでは、Originator Profile（OP）の Content Attestation（CA）を、
単一ページ内のコンテンツ証明だけでなく、サイト全体の信頼構造として扱う方法を検証する。

Phase 1では、`ExternalResourceTargetIntegrity` から Site Manifest を参照し、
Manifest に記述された `items[].url` とページ内リンクを対応付けることで、
複数の記事領域を OP Inspector 上で可視化できることを確認した。

Phase 2では、この関係を内部データモデルとして表現し、
Overlay、階層表示、CA検証などから共通利用できる
「Site Trust Graph」の構築を目指す。

---

## 2. 現在の構造

Phase 1では、以下の流れで Site Manifest のリンク先を可視化している。

```text
Content Attestation
        |
        v
ExternalResourceTargetIntegrity
        |
        v
Site Manifest
        |
        v
items[].url
        |
        v
DOM link
        |
        v
Article region
        |
        v
OP Inspector Overlay
```

これにより、トップページのCAへ各記事のCSS Selectorを個別に記述せず、
外部Manifestを介して複数の記事を検証対象として扱える。

## 3. Phase 2 の基本設計

Phase 2では、外部リソースの解析処理と表示処理を分離する。

```
Content Attestation
        |
        v
ExternalResourceTargetIntegrity
        |
        v
External Resource Resolver
        |
        v
Site Trust Graph
        |
        +------------------+
        |                  |
        v                  v
     Overlay           Tree View
```

Overlay自身は Site Manifest のJSON構造を直接解釈しない。

Resolverが外部リソースを解析し、
共通のTrust Nodeへ変換する。

## 4. Trust Node

Site Trust Graphを構成する基本単位として、
以下のような共通ノードを使用する。

```
export type TrustNodeType =
  | "site"
  | "manifest"
  | "section"
  | "article"
  | "paragraph"
  | "advertisement";

export interface TrustNode {
  id: string;
  type: TrustNodeType;
  title: string;

  url?: string;
  casUrl?: string;

  verified?: boolean;

  lazy?: boolean;

  children?: TrustNode[];
}
```

`TrustNode` はUI固有のDOM情報を持たず、
サイト上の信頼関係そのものを表現する。

これにより同じデータを、

- Overlay
- Tree View
- CA検証
- 検索
- AI向けデータ出力

などから共通利用できる。

## 5. JiJi Style の例

現在の JiJi Style の Site Manifest は、
トップページに掲載される記事を以下のような構造として表現している。

```
JiJi Style
|
+-- Site Manifest
    |
    +-- Featured
    |   |
    |   +-- Cabana Shirt Style
    |
    +-- Daily Style
    |   |
    |   +-- Summer White Shirt Styles
    |   +-- Black T-shirt Style
    |   +-- Summer Amekaji T-shirt Style
    |
    +-- Wardrobe
    |   |
    |   +-- Article
    |   +-- Article
    |   +-- ...
    |
    +-- Classic Menswear
        |
        +-- Article
        +-- Article
        +-- ...
```

Phase 1では、この構造から記事URLを取得し、
対応するページ内DOM要素をハイライトしている。

Phase 2では、同じ構造をInspector上でもツリーとして表示する。

## 6. CA Tree への拡張

記事CAを取得することで、Site Trust Graphはさらに深い階層へ展開できる。

```
Site
|
+-- Site Manifest
    |
    +-- Article
        |
        +-- Article CA
            |
            +-- Paragraph CA
            |
            +-- Advertisement CA
```

広告CAが広告主の情報やリンク先Site Profileを参照する場合、
さらに別サイトへ信頼関係を展開できる。

```
Media Site
|
+-- Article
    |
    +-- Advertisement
        |
        +-- Advertiser
            |
            +-- Site Profile
            |
            +-- Site Manifest
```

この構造は、単純なTreeではなく、
将来的には複数サイト間を接続する Trust Graph として扱える可能性がある。

## 7. 大規模サイトへの対応

JiJi Styleではトップページの記事数が少ないため、
単一の Site Manifest で十分に扱える。

一方、新聞社や大規模メディアでは、
トップページやサイト全体に数百から数千のコンテンツが存在する可能性がある。

そのため、すべてのArticle CAを初期表示時に取得する設計は避ける。

以下を検討する。

- Lazy Loading
- 展開したノードのみCA取得
- CA取得の同時実行数制限
- URL / CA単位のキャッシュ
- 重複CA取得の排除
- Manifestの分割
- 差分更新

## 8. Manifest of Manifests

大規模サイトでは、単一の Site Manifest にすべての記事を格納するのではなく、
Manifest自体を階層化する方法も検討する。

```
Site Manifest
|
+-- Top Stories Manifest
|
+-- Politics Manifest
|
+-- Business Manifest
|
+-- Sports Manifest
|
+-- Local Manifest
```

Inspectorは最上位Manifestだけを最初に取得し、
利用者がカテゴリを展開したときに
下位Manifestを取得する。

```
Site
|
+-- Site Manifest
    |
    +-- Politics
    |    [lazy]
    |
    +-- Business
    |    [lazy]
    |
    +-- Sports
         [lazy]
```

これにより、大規模サイトでもネットワーク負荷と
Inspector側の処理負荷を抑制できる。

## 9. External Resource Resolver

Site Manifest固有の処理をOverlayへ直接実装せず、
外部リソースを解決するResolverとして分離する。

概念的には以下のような構造を想定する。

```
interface ExternalResourceResolver {
  canResolve(value: unknown): boolean;

  resolve(
    resourceUrl: string,
    value: unknown,
  ): Promise<TrustNode | null>;
}
```

最初のResolverは Site Manifest を対象とする。

```
ExternalResourceTargetIntegrity
        |
        v
Resolver Registry
        |
        +-- SiteManifestResolver
        |
        +-- Future Resolver
        |
        +-- Future Resolver
```

将来的に別種の外部Manifestが必要になった場合も、
Overlayを変更せずResolverを追加できる構造を目指す。

## 10. OP仕様との関係

現段階では新しいTarget typeを追加せず、
既存の ExternalResourceTargetIntegrity を利用する。

つまり本プロトタイプは、
現在のOP仕様を利用してどこまでサイト単位の信頼構造を表現できるかを
検証するものである。

将来、実運用上の必要性が明確になった場合には、

- Site Manifestの標準的なデータモデル
- Manifest間の参照方法
- Site Trust Graphの機械可読表現
- 新しいTarget typeの必要性

などをOP仕様への提案として検討する。

## 11. 今後の実装フェーズ

### Phase 2-1

- TrustNode導入
- SiteManifestResolver導入
- 既存Overlayの動作維持

### Phase 2-2

- TrustTree表示
- Site / Section / Article の階層表示

### Phase 2-3

- TreeとOverlayの連動
- Tree上の記事選択によるページ内ハイライト

### Phase 2-4

- Article CA取得
- CA検証結果の表示

### Phase 2-5

- Lazy Loading
- Manifest of Manifests
- 大規模メディアサイトでの性能検証

## 12. 将来像

Site Trust Graphは、単なるInspectorのUI機能ではなく、
Web上のコンテンツ間の信頼関係を機械可読かつ人間にも理解可能な形で表現するための
基礎モデルとなる可能性がある。

```
Site
  |
  +-- Manifest
        |
        +-- Article
              |
              +-- Content
              |
              +-- Advertisement
                      |
                      +-- Advertiser Site
```

検索エンジンや生成AIが取得する信頼構造と、
人間がOP Inspectorで確認する信頼構造を
同じデータモデルから生成できることを目指す。
