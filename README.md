# soraPromptBuilder

いいですね、超実践的に作ります。
以下はそのままコピペして使える**（A）ChatGPT用プロンプトテンプレート** と **（B）Sora用プロンプトテンプレート** です。
出力フォーマットはSoraに受け渡しやすい**厳密なJSON**を想定しています。あとにすぐ実験できるよう、テンプレートと使い方の短いチェックリストも付けます。

# 1) 使い方（概要）

1. ChatGPT用プロンプトに「英単語1語」を投げる → ChatGPTがJSONで返す（英単語・和訳・発音情報・英語例文＋例文和訳・Sora向けの詳細なシーン説明を含む）。
2. 返ってきたJSONをSora用プロンプトテンプレートのプレースホルダに差し込み、Soraに渡す（もしくは自動化スクリプトで組み立てる）。
3. Soraは短尺（9:16）ショート動画を出力。順序は「英単語（発音）→和訳→英語例文（発音＋字幕）→例文和訳＋例文に関する動画」。

---

# 2) （A）ChatGPT に投げるプロンプト（テンプレート）

そのままコピーして使ってください。**重要：出力は必ずJSONのみ**（余分な説明文や注釈を付けないでください）。

```text
あなたは「英語学習ショート動画コンテンツ生成アシスタント」です。以下の仕様に厳密に従ってください。
入力：英単語（1語）。出力：厳密なJSONのみ。余分なテキストは一切禁止。

【JSON スキーマ（必須フィールド）】
{
  "word": string,                       // 入力単語（小文字/大文字は入力に合わせる）
  "part_of_speech": string,             // 品詞（noun/verb/adj 等、英語で）
  "ipa": string,                        // 発音記号（可能ならIPA）
  "translation_ja": string,             // 日本語の簡潔な訳（短め）
  "tts": {                              // TTS 推奨設定（Soraで使う）
    "english_voice": string,
    "japanese_voice": string,
    "english_rate": number,
    "japanese_rate": number
  },
  "clips": [                            // 画面順（必ずこの順で4つ以上のクリップを作る）
    { "id":"word", "type":"word_display", "duration":number, "text_en":string, "subtitle_en":string, "subtitle_ja":string, "tts_text":string, "tts_lang":string },
    { "id":"translation", "type":"translation_display", "duration":number, "text_ja":string, "tts_text":string, "tts_lang":string },
    { "id":"example", "type":"example_sentence", "duration":number,
      "text_en":string, "subtitle_en":string, "subtitle_ja":string, "tts_text":string, "tts_lang":string,
      "scene_description": string,       // Sora向けの詳細なシーン説明（下記ルール参照）
      "scene_timing": [                  // 例: [{"time":0.0,"action":"..."}, ...] (relative seconds within clip)
        { "time": number, "action": string }
      ],
      "visual_tags": [string],           // 例: ["3D_cartoon","whimsical","closeup"]
      "sfx": [string]                   // 推奨効果音タグ（任意）
    },
    { "id":"example_translation", "type":"translation_display", "duration":number, "text_ja":string, "tts_text":string, "tts_lang":string }
  ],
  "meta": {
    "aspect_ratio":"9:16",
    "resolution":"1080x1920",
    "fps": number,
    "bgm": { "name": string, "volume_db": number },
    "subtitle_style": { "font": string, "size": number, "color": string, "shadow": boolean }
  }
}

【生成ルール（厳守）】
1. 例文は**英語で一文**。入力単語を**文中に1回だけ**含めること（原形・派生語も可だが明示）。
2. 例文は**ユニークで面白い**（例：擬人化、意外性、シュールさ）。ただし家族向け（不快・差別・商標・固有人名・成人向け禁止）。
3. 例文の長さは原則**6〜14語**で、学習者が音声で追いやすい長さにする。
4. scene_descriptionはSoraがそのまま「映像を作れる」ように**具体的に**書く（登場人物外観、小道具、背景、カメラ動作、色味、テンポ、表情、重要なモーション、終端のフリーズやテキスト出し）。
5. scene_timingはクリップ内の時間指定でアニメーションのキーポイントを書く（秒数はクリップduration以下）。
6. 翻訳（subtitle_ja）は簡潔で自然な日本語に。
7. tts推奨は実在する主要TTS名（例: en-US-Wavenet-F / ja-JP-Wavenet-A）やSoraが受け取りやすい表記で。rateはおおむね0.9〜1.1。

以上に従って、入力単語のみ与えられたら**厳密にJSONだけ**で出力してください。
```

---

# 3) ChatGPT出力での `scene_description` 書き方（ガイド）

* 具体性：登場キャラ（年齢感・服装・表情）、場所（例：小さな台所、夜の屋上）、光（朝日／スポットライト）、アクション（〜を拾って〜する）、カメラ（wide→close→zoomin）、画調（3Dカートゥーン／水彩／写実）、テンポ（ゆったり／切れ味）を必ず入れる。
* 例（イメージ）："A tiny cartoon cat in a polka-dot apron tiptoes across a giant piano key in a bright morning kitchen. Start wide, then slow dolly in to close-up of cat's smug face at 2.5s; at 4.5s freeze-frame and pop the word."

---

# 4) （B）Sora に投げるプロンプトテンプレート（自然文型 — そのままSoraにペーストできる）

下のテンプレートの `{{...}}` をChatGPTが出したJSONの値で置き換えてください（もしくは自動スクリプトで挿入）。

```text
Create a vertical short (aspect 9:16, 1080x1920, 30fps) optimized for social shorts. Total sequence: 1) word display 2) translation 3) example_sentence scene (with TTS in English and subtitles) 4) example_translation.

Global style: bright, friendly, modern rounded UI, large readable subtitles at bottom center (font: {{meta.subtitle_style.font}}, size {{meta.subtitle_style.size}}). Background music: "{{meta.bgm.name}}" at {{meta.bgm.volume_db}} dB. Use quick 0.18s crossfade between clips.

Clip A — Word display (duration {{clips[0].duration}}s):
- Show the English word centered in very large bold type: "{{clips[0].text_en}}".
- TTS: use {{tts.english_voice}} reading "{{clips[0].tts_text}}" at rate {{tts.english_rate}}. Play TTS immediately (0.00s).
- Subtitle (EN) bottom-center: "{{clips[0].subtitle_en}}". Also show small Japanese hint above subtitle: "{{clips[0].subtitle_ja}}".
- Visual: minimalist animated background (soft gradient), slight scale-in on text (0→1.05→1).

Clip B — Translation display (duration {{clips[1].duration}}s):
- Large Japanese translation: "{{clips[1].text_ja}}".
- TTS: use {{tts.japanese_voice}} reading "{{clips[1].tts_text}}" at rate {{tts.japanese_rate}}.
- Simple swipe-in animation from bottom.

Clip C — Example sentence scene (duration {{clips[2].duration}}s):
- Follow this scene description exactly: {{clips[2].scene_description}}.
- Play English TTS (voice {{tts.english_voice}}) of the example: "{{clips[2].tts_text}}". Subtitles: English (bottom) = "{{clips[2].subtitle_en}}"; Japanese translation (smaller) appears above the English subtitle = "{{clips[2].subtitle_ja}}".
- Apply the scene_timing actions (execute sequentially):
  {{#each clips[2].scene_timing}}
   - At {{this.time}}s: {{this.action}}
  {{/each}}
- Visual style tags: {{clips[2].visual_tags}}. Use sfx: {{clips[2].sfx}} when appropriate. If characters speak, lip-sync TTS to character mouth.

Clip D — Example translation (duration {{clips[3].duration}}s):
- Show the Japanese translation clearly: "{{clips[3].text_ja}}".
- TTS: {{tts.japanese_voice}} reads "{{clips[3].tts_text}}".
- End with a 0.6s outro: app logo or short CTA text ("もっと見る ▶︎") (optional).

Rendering notes:
- Subtitles: white text + soft shadow, max 2 lines, auto-wrap at ~30 chars per line. Keep subtitle display slightly earlier (0.05s) than spoken audio and remain until 0.2s after audio end.
- Loudness: normalize speech to -16 LUFS, bgm at least -14dB below voice.
- Keep total length compact (ideal 10–16s). Ensure all TTS and animations finish cleanly before cut.
```

> ※ 上の `{{#each ...}}` 部分はテンプレート表記です。自動化がなければ手で scene_timing の箇条を貼り付けてください。

---

# 5) 実行チェックリスト（短く）

* 出力比率：9:16、1080×1920。
* 文字読みやすさ：字幕は大きめ・2行以内。
* 発話→字幕の同期：字幕は発話より0.05秒早く表示。
* 例文は必ず入力単語を1回含む。
* 例文のシーンは `scene_description` に沿って忠実に再現。
* 音量：音声優先、BGMは抑えめ。

---

# 6) （参考）簡単な例（イメージ）

※これはテンプレートがどう使われるかの**最小例**です（実際はChatGPTプロンプトで自動生成されるべきJSONの一部例）。

```json
{
  "word": "saunter",
  "part_of_speech": "verb",
  "ipa": "ˈsɔːn.tər",
  "translation_ja": "ぶらぶら歩く／のんびり歩く",
  "tts": {
    "english_voice": "en-US-Wavenet-F",
    "japanese_voice": "ja-JP-Wavenet-A",
    "english_rate": 1.0,
    "japanese_rate": 1.0
  },
  "clips": [
    { "id":"word", "type":"word_display", "duration":2.2, "text_en":"saunter", "subtitle_en":"saunter", "subtitle_ja":"ぶらぶら歩く", "tts_text":"saunter", "tts_lang":"en-US" },
    { "id":"translation", "type":"translation_display", "duration":1.6, "text_ja":"ぶらぶら歩く", "tts_text":"ぶらぶらあるく", "tts_lang":"ja-JP" },
    { "id":"example", "type":"example_sentence", "duration":6.0,
      "text_en":"The raccoon sauntered into the bakery like it had a VIP pass.",
      "subtitle_en":"The raccoon sauntered into the bakery like it had a VIP pass.",
      "subtitle_ja":"アライグマがVIPみたいにパン屋にぶらりと入ってきた。",
      "tts_text":"The raccoon sauntered into the bakery like it had a VIP pass.",
      "tts_lang":"en-US",
      "scene_description":"A whimsical 3D cartoon bakery at sunrise. A small raccoon in sunglasses strolls in confidently, inspects pastries, shrugs and picks a croissant. Camera: wide → slow dolly to close-up of raccoon's smug grin. Color: warm pastel. At the end, freeze-frame and pop the word 'saunter' in playful type.",
      "scene_timing":[ {"time":0.0,"action":"wide shot: raccoon approaches door"}, {"time":1.8,"action":"dolly in to counter as raccoon sniffs pastries"}, {"time":4.2,"action":"close-up grin + freeze-frame + pop word"} ],
      "visual_tags":["3D_cartoon","whimsical","warm_pastel"],
      "sfx":["door_chime","comic_pop"]
    },
    { "id":"example_translation", "type":"translation_display", "duration":2.0, "text_ja":"アライグマがVIPみたいにパン屋にぶらりと入ってきた。", "tts_text":"アライグマがVIPみたいにパン屋にぶらりと入ってきた。", "tts_lang":"ja-JP" }
  ],
  "meta": { "aspect_ratio":"9:16", "resolution":"1080x1920", "fps":30, "bgm": {"name":"light_pop_loop","volume_db":-20}, "subtitle_style":{"font":"Inter-Bold","size":48,"color":"#FFFFFF","shadow":true} }
}
```

---

# 7) 最後に（次のアクション）

テンプレートは準備済みです。
では**英単語を1語**送ってください（例: `banana` や `saunter`）。
送っていただければ、上のChatGPTプロンプトに従ってJSONを生成し、Sora用の最終プロンプトも組み立ててお渡しします。準備OKです！

