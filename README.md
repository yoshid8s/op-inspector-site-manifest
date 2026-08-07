# OP Inspector サイトマニフェスト・プロトタイプ

Site Manifest対応の拡張機能プロトタイプ

OP Inspectorにおけるサイトマニフェスト（Site Manifest）対応のプロトタイプ実装です。

## 開発の背景

ニュースサイトや自治体のトップページは、日々更新されるため、CA情報を埋め込むと毎日、CA更新が必要となります。
その結果、CAサーバーへの負荷も高まるだけでなく、サイト運営者にとっても保守の容易性が低下します。

従って、さまざまなページへのリンクが多数存在するトップページには
通常のページへのCA発行とは異なるモデルが必要ではないかと考え、
本プロトタイプが利用する「サイトのリンク構成を記述する」サイトマニフェストの考案に至りました。

## 開発対象サイト

本プロトタイプは、下記の筆者が運営するファッションブログで動作を確認しています。

https://style.yh-inc.jp/

Webサイト環境

WordPressをヘッドレスCMSとして利用し、
WordPress REST APIから取得したコンテンツをAstroで静的HTMLとして生成しています。

フロントエンドのビルドおよびCA発行にはGitHub Actionsを利用しています。
現在、一部の処理は手動ですが、今後さらに自動化する予定です。

## 本プロトタイプの位置付け

本プロトタイプは、公開されているOPのOSS実装を基に独自に拡張するもので、
OP組合の公式プロトタイプではありません。

## 概要

本プロトタイプは、OP組合が公開している[CA Playground(試験環境）向けのChrome拡張機能](https://github.com/originator-profile/originator-profile/releases/tag/canary)を拡張したものです。

本リポジトリでは、サイトマニフェストを活用して、以下の要素を接続する「サイトCAツリー（Site CA Tree）」を構築する方法を検証します。

```
サイト
├── 特集記事
├── カテゴリ別記事
└── 段落レベルのコンテンツ証明（Content Attestations）
```

## 目的

本プロトタイプの目的は、ウェブサイト全体と個々のコンテンツ証明との間の信頼関係を可視化し、検証することにあります。

サイトマニフェストをWebサーバー上に配置することで、検索エンジンや生成AIは、

```
「サイトCA → 記事CA → 段落CA」という階層構造
```

という階層関係を機械可読な情報として取得・利用できる可能性があります。

しかしながら、サイトマニフェストを人が理解することは難しいため、
本プロトタイプで、当該サイトの階層的な信頼モデルを可視化することに取り組みます。

## サイトマニフェストの具体例

以下は、本プロトタイプを検証するために利用するファッションブログ JiJi Styleに搭載されたサイトマニフェストです。
JiJi Styleのトップページに含まれる16の記事ページへのリンク構成を示すものです。

https://style.yh-inc.jp/site-manifest.json

```
{
  "site": "https://style.yh-inc.jp/",
  "page": "https://style.yh-inc.jp/",
  "generatedAt": "2026-08-06T07:26:39.255Z",
  "items": [
    {
      "position": 1,
      "role": "featured",
      "headline": "ジジイのCabana Shirt Style",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEcabana-shirt-style/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/3623_cas.json"
    },
    {
      "position": 2,
      "role": "daily-style",
      "headline": "ジジイのSummer White Shirt Styles : 3 looks",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEsummer-white-shirt-styles-3-looks/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/3601_cas.json"
    },
    {
      "position": 3,
      "role": "daily-style",
      "headline": "Black T-shirt style—inspired by Giorgio Armani.",
      "url": "https://style.yh-inc.jp/black-t-shirt-style-inspired-by-giorgio-armani/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/3589_cas.json"
    },
    {
      "position": 4,
      "role": "daily-style",
      "headline": "Summer “Amekaji” T shirt Style",
      "url": "https://style.yh-inc.jp/summer-amekaji-t-shirt-style/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/3575_cas.json"
    },
    {
      "position": 5,
      "role": "wardrobe",
      "headline": "ジジイ in Paris / Memories of January 2020",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4-in-paris-memories-of-january-2020/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/446_cas.json"
    },
    {
      "position": 6,
      "role": "wardrobe",
      "headline": "Rainy day / Eral55 jacket with chino pants",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AErainy-day-jacket-style-eral55-jacket-with-chino-pants/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/485_cas.json"
    },
    {
      "position": 7,
      "role": "wardrobe",
      "headline": "Weekend Style / Lemaire Field Jacket with Eral 55 light weight cotton pants",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEweekend-style-lemaire-field-jacket-with-eral-55-light-weight-cotton-pants/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/454_cas.json"
    },
    {
      "position": 8,
      "role": "wardrobe",
      "headline": "Sartorio Peak-Lapel Single Breasted Suit",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEpeak-lapel-single-breasted-suit/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/389_cas.json"
    },
    {
      "position": 9,
      "role": "wardrobe",
      "headline": "Vintage Safari Jacket Style",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEsafari-jacket-style/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/356_cas.json"
    },
    {
      "position": 10,
      "role": "wardrobe",
      "headline": "Denim on denim style / white denim combination with Svevo knit polo",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEdenim-on-denim-style-white-denim-combination-with-svevo-knit-polo/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/324_cas.json"
    },
    {
      "position": 11,
      "role": "classic-menswear",
      "headline": "What exactly is “Sprezzatura,” a suit style that looks relaxed and natural?",
      "url": "https://style.yh-inc.jp/what-exactly-is-sprezzatura-a-suit-style-that-looks-relaxed-and-natural/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/3409_cas.json"
    },
    {
      "position": 12,
      "role": "classic-menswear",
      "headline": "Classic knitwear that gentlemen should choose, SVEVO",
      "url": "https://style.yh-inc.jp/classic-knitwear-that-gentlemen-should-choose-svevo/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/3511_cas.json"
    },
    {
      "position": 13,
      "role": "classic-menswear",
      "headline": "ジジイのOff White Jacket style with Dark green trousers",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEoff-white-jacket-style-with-dark-green-trousers/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/339_cas.json"
    },
    {
      "position": 14,
      "role": "classic-menswear",
      "headline": "ジジイのClassic Navy Suit Style",
      "url": "https://style.yh-inc.jp/classic-navy-suit-style/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/688_cas.json"
    },
    {
      "position": 15,
      "role": "classic-menswear",
      "headline": "ジジイのBlue cotton suit style",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEblue-cotton-suit-style/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/705_cas.json"
    },
    {
      "position": 16,
      "role": "classic-menswear",
      "headline": "ジジイのSolaro suit style / Liverano & Liverano",
      "url": "https://style.yh-inc.jp/%E3%82%B8%E3%82%B8%E3%82%A4%E3%81%AEsolaro-suit-style-liverano-liverano/",
      "casUrl": "https://style.yh-inc.jp/astro-cas/581_cas.json"
    }
  ]
}
```

## 開発フェーズ

### Phase 1
- Site Manifestの取得
- `items[].url` とページ内リンクの対応付け
- 対応する記事領域のハイライト表示

### Phase 2
- Site CA Treeのツリー表示
- 各記事CAの取得・検証結果の表示

### Phase 3
- 記事CAから段落CA、広告CA、リンク先サイトのSite Profileへの展開
- OP仕様への提案に向けた検証

## 現状

Phase 1は完了しました。

✅ `ExternalResourceTargetIntegrity` を介して Site Manifest を解決可能です。

✅ Inspector は、`site-manifest.json` で参照されているすべての記事カードをハイライト表示します。

これは、Content Attestation が外部マニフェストを通じて、現在の HTML ドキュメント外にあるリソースを検証・可視化できることを実証しています。

### Phase 1　完了後のJiJi Styleトップページ
CAが他のリソースを参照し、そのリソースを介して複数のコンテンツを検証対象にできるという新しい利用モデルを実証しています。

これまでInspectorは

```
TextTargetIntegrity
    ↓
cssSelector
    ↓
DOM要素
```

だけを対象としていましたが、今回初めて

```
ExternalResourceTargetIntegrity
        ↓
Site Manifest
        ↓
複数ページ
        ↓
複数カード
```

という階層的な対象指定が実現できました。

下の画像にある、記事リンクを囲う点線は、DOM要素に含まれるCAではなく、
サイトマニフェストで指定されたCA発行済みの記事のリンク要素を本プロトタイプが表示しています。

<img width="1443" height="803" alt="image" src="https://github.com/user-attachments/assets/76e749f7-06d2-40b9-8833-c5d765d71809" />

