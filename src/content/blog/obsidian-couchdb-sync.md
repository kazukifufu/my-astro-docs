---
title: "Docker Composeで構築！ObsidianのSelf-hosted LiveSync用CouchDBサーバー"
category: "🐳 インフラ・Docker"
date: "2026-06-05"
---

## はじめに

日々のタスク管理やアイデアの整理に **Obsidian** を愛用している方は多いのではないでしょうか。

Obsidianの強力な機能の一つにデバイス間の同期がありますが、公式の「Obsidian Sync」は素晴らしいものの、月額費用が少し気になるところです。
そこで選択肢に挙がるのが、コミュニティプラグインの **「Self-hosted LiveSync」** を使った自前での同期環境の構築です。

このプラグインは裏側で **Apache CouchDB** というNoSQLデータベースを利用しており、文字を入力した瞬間に同期される「リアルタイム同期」が魅力です。

今回は、このCouchDBを **Docker Compose** を使って立ち上げ、ObsidianのVault（保管庫）用データベースを作成するまでの具体的なステップを詳しく解説します。

---

### 1. 開発環境・動作確認環境

今回の構築にあたって、動作を確認した環境は以下の通りです。

* **OS:** Ubuntu 24.04 LTS / macOS (Dark Mode)
* **Docker:** v26.0.0
* **Docker Compose:** v2.25.0
* **Apache CouchDB:** v3.4.2
* **Obsidian:** v1.5.x / Self-hosted LiveSync プラグイン導入済

---

### 2. 構築のステップ

環境構築は以下の3ステップで進めます。

1. 設定ファイル（`docker-compose.yml`, `local.ini`）の準備
2. Docker Compose によるコンテナの起動
3. Web管理画面（Fauxton）でのObsidian用データベース作成

---

#### Step 1. 設定ファイルの準備

まずは作業用のフォルダ（例: `couchdb-live-sync`）を作成し、その中に **2つのファイル** を準備します。

##### 1.1 `docker-compose.yml` の作成

CouchDBのコンテナを定義します。データをローカルに永続化し、LiveSyncに必要な設定ファイルをマウントする構成です。

```yaml
services:
  couchdb:
    # バージョンを 3.5.2 に固定。
    # CouchDB はメジャーバージョンアップで設定スキーマ・API が変わる場合があるため
    # バージョンを固定して意図しない更新を防ぐ。
    # バージョンアップ時は Obsidian LiveSync プラグインとの互換性を確認すること。
    image: couchdb:3.5.2
    container_name: obsidian-couchdb
    restart: always
    # 【restart: always と unless-stopped の違い】
    # always         : Docker デーモン起動時・コンテナ停止時に常に再起動する
    #                  手動で docker stop しても再起動される
    # unless-stopped : 手動で停止した場合は再起動しない
    # Obsidian の同期サーバーは常時稼働が必要なため always を採用する。

    ports:
      # CouchDB のデフォルト HTTP ポート。
      # Obsidian LiveSync プラグインはこのポートに接続してノートを同期する。
      # 外部（インターネット）に公開する場合はリバースプロキシ経由で
      # HTTPS 化することを強く推奨する（平文 HTTP での公開はパスワードが
      # 平文で流れるリスクがある）。
      - "5984:5984"

    volumes:
      # CouchDB のデータベースファイルの永続化先。
      # コンテナを削除・再作成しても Obsidian のノートデータが保持される。
      # バックアップ対象に含めること。
      - ./data:/opt/couchdb/data

      # CouchDB のカスタム設定ファイル。
      # Obsidian LiveSync に必要な設定（主に CORS・認証）を記述する。
      # 最低限以下の設定が必要：
      #   [chttpd]
      #   bind_address = 0.0.0.0
      #
      #   [httpd]
      #   enable_cors = true
      #
      #   [cors]
      #   origins = app://obsidian.md, capacitor://localhost, http://localhost
      # コンテナ起動前に ./local.ini が存在することを確認すること。
      - ./local.ini:/opt/couchdb/etc/local.ini

    environment:
      # CouchDB の管理者ユーザー名。
      # Obsidian LiveSync の接続設定で使用する。
      - COUCHDB_USER=admin

      # パスワードを直接記述するのではなく .env ファイルで管理する
      #
      #   .env ファイル:
      #     COUCHDB_PASSWORD=強力なパスワード
      # .env は Git リポジトリに含めないこと（.gitignore に追加する）。
      - COUCHDB_PASSWORD=${COUCHDB_PASSWORD}

    labels:
      jp.hatenablog.owner.inventory.role:           "obsidian-sync-database"
      jp.hatenablog.owner.inventory.env:            "production"
      jp.hatenablog.owner.inventory.owner:          "kazukifu"
      jp.hatenablog.owner.inventory.port.host:      "5984"
      jp.hatenablog.owner.inventory.port.container: "5984"
      jp.hatenablog.owner.inventory.port.protocol:  "tcp"
      jp.hatenablog.owner.inventory.description: |
        Obsidian LiveSync 用 CouchDB 3.5.2。
        Obsidian のノートをデバイス間でリアルタイム同期するバックエンド。
        local.ini で CORS・認証設定を管理。
        データは ./data に永続化。
        外部公開する場合はリバースプロキシ経由で HTTPS 化すること。
```

```.env
COUCHDB_PASSWORD=my_secure_password ★強力なパスワードに変更してください
```

##### 1.2 `local.ini` の作成

ObsidianのLiveSyncプラグインを正常に動作させるため、CouchDBの「CORS（クロスオリジンリソース共有）」や「最大ファイル受け入れサイズ（添付ファイル用）」を調整する設定ファイルです。`docker-compose.yml` と**同じフォルダ**に作成してください。

```ini
[chttpd]
port = 5984
bind_address = 0.0.0.0
# 大きな画像や添付ファイルを同期できるように最大受け入れサイズを拡張（約500MB）
max_http_request_size = 524288000

[chttpd_auth]
# LiveSyncに必要なセッション認証を有効化
require_valid_user = true
# Recommended for 3.5.2 to ensure smooth token authentication
authentication_redirect = /_utils/session.html

[httpd]
enable_cors = true

[cors]
origins = app://obsidian.md, capacitor://localhost, http://localhost
credentials = true
methods = GET, PUT, POST, HEAD, DELETE
# Added essential CouchDB replication headers required by LiveSync
headers = accept, authorization, content-type, origin, referer, x-csrf-token, X-Couch-Full-Commit, If-Match

[couchdb]
# Optional: Increases max document size to match your 500MB HTTP request limit
max_document_size = 524288000

```

---

#### Step 2. Docker Compose による起動

ファイルの準備ができたら、ターミナルを開いて対象フォルダに移動し、以下のコマンドを実行します。

```bash
docker compose up -d

```

`-d` オプションをつけることで、バックグラウンド（デタッチドモード）でCouchDBが起動します。初回はイメージのダウンロードが行われるため、少し時間がかかります。

---

#### Step 3. Web管理画面でのObsidian用データベース作成

CouchDBには、ブラウザからデータベースを操作できる **「Fauxton」** という優秀な管理画面が最初から付属しています。

1. ブラウザを開き、 `http://localhost:5984/_utils/` にアクセスします。
2. ログイン画面が表示されるので、`docker-compose.yml` で設定した **ユーザー名（COUCHDB_USER）** と **パスワード（COUCHDB_PASSWORD）** を入力してログインします。
3. 画面右上にある **「Create Database」** ボタンをクリックします。
4. データベース名（例: `obsidian-vault-kf`）を入力し、Non-partitioned を選択した状態で「Create」をクリックします。

これで、Obsidianのデータを流し込むための器（データベース）の準備が完了しました。

---

## おわりに

以上で、Docker Composeを使ったObsidian用CouchDBサーバーの構築、およびデータベースの作成ステップは完了です。
一度設定ファイルを作ってしまえば、コマンドで全く同じ環境を再現できるのがDockerの強みですね。

この後は、Obsidian側の「Self-hosted LiveSync」プラグインの設定画面（🧙‍♂️魔法使いのウィザードタブなど）を開き、今回作成したCouchDBのURLや認証情報を入力すれば、1文字タイピングするごとに手元のスマホや別PCへ一瞬で同期される快適なノート環境が手に入ります。Obsidian側の設定は別の記事で取り上げたいと思います。

「データの主権を自分の手元に残しつつ、限界まで高速な同期環境を作りたい」という方は、ぜひ試してみてください。
