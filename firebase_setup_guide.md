# Firebase設定ガイド

チームプールのリアルタイム同期機能を使うためには、Googleの無料サービス「Firebase」の設定が必要です。
以下の手順に沿って設定を行い、取得した情報をコードに貼り付けてください。

## 1. Firebaseプロジェクトの作成
1.  [Firebaseコンソール](https://console.firebase.google.com/) にアクセスし、Googleアカウントでログインします。
2.  「プロジェクトを追加」をクリックします。
3.  プロジェクト名（例: `pangaea-sheet`）を入力し、「続行」をクリックします。
4.  Googleアナリティクスは「無効」で構いません。「プロジェクトを作成」をクリックします。
5.  作成が完了したら「続行」をクリックします。

## 2. Realtime Databaseの作成
1.  左側のメニューから「構築」→「Realtime Database」を選択します。
2.  「データベースを作成」ボタンをクリックします。
3.  ロケーションは `us-central1` （または近い場所）のままで「次へ」。
4.  セキュリティルールは「**テストモードで開始**」を選択し、「有効にする」をクリックします。
    *   ※テストモードは30日間誰でも読み書き可能です。身内での使用であればまずはこれでOKです。

## 3. アプリの登録と設定情報の取得
1.  プロジェクトのトップページ（「プロジェクトの概要」）に戻ります。
2.  画面中央付近にある「</> (ウェブ)」アイコンをクリックします。
3.  アプリのニックネーム（例: `PangaeaSheet`）を入力し、「アプリを登録」をクリックします。
4.  「**SDK の設定と構成**」という画面が表示されます。
5.  その中に `const firebaseConfig = { ... };` というコードブロックがあります。
6.  `apiKey` から `appId` までの行（波括弧 `{` と `}` の中身）が必要な情報です。

## 4. コードへの貼り付け
1.  エディタで `pangaea_rebuild/index.html` を開きます。
2.  305行目付近にある以下の部分を探します。

```javascript
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.appspot.com",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
        };
```

3.  この部分を、先ほどFirebaseコンソールでコピーした内容で**上書き**してください。

## 完了
設定を保存し、サイトを更新（リロード）すれば、同期機能が有効になります。
もしわからない場合は、コピーした `const firebaseConfig = ...` の中身をチャットで教えていただければ、私が代わりに貼り付け作業を行います。
