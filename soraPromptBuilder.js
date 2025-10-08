// soraPromptBuilder.js
// ChatGPTで生成された英単語JSONを読み込み、Sora用プロンプトに変換する

function buildSoraPrompt(data) {
  const { word, tts, clips, meta } = data;
  const [wordClip, translationClip, exampleClip, exampleTransClip] = clips;

  return `
Create a vertical short (aspect ${meta.aspect_ratio}, ${meta.resolution}, ${meta.fps}fps) optimized for social shorts.  
Total sequence: 1) word display 2) translation 3) example_sentence scene (with TTS in English and subtitles) 4) example_translation.

Global style: bright, friendly, modern rounded UI, large readable subtitles at bottom center (font: ${meta.subtitle_style.font}, size ${meta.subtitle_style.size}). Background music: "${meta.bgm.name}" at ${meta.bgm.volume_db} dB. Use quick 0.18s crossfade between clips.

Clip A — Word display (duration ${wordClip.duration}s):
- Show the English word centered in very large bold type: "${wordClip.text_en}".
- TTS: use ${tts.english_voice} reading "${wordClip.tts_text}" at rate ${tts.english_rate}. Play TTS immediately (0.00s).
- Subtitle (EN) bottom-center: "${wordClip.subtitle_en}". Also show small Japanese hint above subtitle: "${wordClip.subtitle_ja}".
- Visual: minimalist animated background (soft gradient), slight scale-in on text (0→1.05→1).

Clip B — Translation display (duration ${translationClip.duration}s):
- Large Japanese translation: "${translationClip.text_ja}".
- TTS: use ${tts.japanese_voice} reading "${translationClip.tts_text}" at rate ${tts.japanese_rate}.
- Simple swipe-in animation from bottom.

Clip C — Example sentence scene (duration ${exampleClip.duration}s):
- Scene description:
  ${exampleClip.scene_description}
- Play English TTS (voice ${tts.english_voice}) of the example: "${exampleClip.tts_text}".
- Subtitles:
   - English (bottom): "${exampleClip.subtitle_en}"
   - Japanese (above): "${exampleClip.subtitle_ja}"
- Scene timing:
${exampleClip.scene_timing
  .map(t => `   - At ${t.time}s: ${t.action}`)
  .join('\n')}
- Visual style tags: ${exampleClip.visual_tags.join(', ')}
- Use sfx: ${exampleClip.sfx.join(', ')}
- If characters speak, lip-sync TTS to character mouth.

Clip D — Example translation (duration ${exampleTransClip.duration}s):
- Show the Japanese translation clearly: "${exampleTransClip.text_ja}".
- TTS: ${tts.japanese_voice} reads "${exampleTransClip.tts_text}".

Rendering notes:
- Subtitles: white text + soft shadow, max 2 lines, auto-wrap at ~30 chars per line.
- Keep subtitle display slightly earlier (0.05s) than spoken audio and remain until 0.2s after audio end.
- Loudness: normalize speech to -16 LUFS, bgm at least -14dB below voice.
- Keep total length compact (ideal 10–16s). Ensure all TTS and animations finish cleanly before cut.
`.trim();
}

// 使用例：
// const fs = require('fs');
// const json = JSON.parse(fs.readFileSync('./consider.json', 'utf-8'));
// console.log(buildSoraPrompt(json));

module.exports = { buildSoraPrompt };

