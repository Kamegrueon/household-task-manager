#!/bin/bash

# 1. スキップ判定
if [ "$SKIP_GEMINI" = "1" ]; then
  echo "--- Gemini Code Review Skipped by user ---"
  exit 0
fi

# 2. 差分の取得
DIFF=$(git diff --cached)
if [ -z "$DIFF" ]; then
  exit 0
fi

echo "--- Gemini Code Reviewing... ---"

# 3. プロンプトの作成
# 改行を含めるとコマンド引数として壊れる可能性があるため、変数にまとめます
PROMPT="あなたは優秀なエンジニアです。
以下のコード差分をレビューし、修正が必要な点や改善点があれば日本語で短く列挙してください。
修正が不要で、このままコミットして良い場合は、回答の中に必ず 'LGTM' という文字列を含めてください。

---
$DIFF"

# 4. Gemini CLIの実行
REVIEW=$(echo "$PROMPT" | gemini -o text -m gemini-2.5-flash-lite)

# 実行に失敗した場合（未ログインや通信エラーなど）
if [ $? -ne 0 ]; then
  echo "❌ Gemini CLIの実行に失敗しました。'gemini auth login' で再ログインを試してください。" >&2
  echo "レビューをスキップしてコミットする場合は 'SKIP_GEMINI=1 git commit' を使用してください。" >&2
  exit 1
fi

# 5. 結果の表示と判定
echo "$REVIEW"
echo "--------------------------------"

# 回答の中に "LGTM" (大文字小文字不問) が含まれているか判定
if echo "$REVIEW" | grep -iq "LGTM"; then
  echo "Gemini: ✅ LGTM! コミットを継続します。"
  exit 0
else
  echo "Gemini: ⚠️ 指摘事項があるためコミットを中断しました。"
  echo "修正するか、'SKIP_GEMINI=1 git commit' でスキップしてください。"
  exit 1
fi
