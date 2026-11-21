"use client";

import { useId, useMemo, useState } from "react";
import s from "./tokenizer.module.css";

type Token = { text: string; id: number; cont: boolean };

// GPT-2 style pre-tokenisation: contractions, words and numbers with their leading space, punctuation.
const PRE = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+/gu;

/** FNV-1a hash → a stable, fake "vocabulary id" in a 50k range. */
function idFor(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % 50257;
}

/** Toy subwords: long words split into ~4-character pieces, like rare words in a real BPE vocabulary. */
function tokenize(input: string): Token[] {
  const out: Token[] = [];
  for (const piece of input.match(PRE) ?? []) {
    const word = piece.trimStart();
    if (word.length <= 6) {
      out.push({ text: piece, id: idFor(piece), cont: false });
      continue;
    }
    const lead = piece.length - word.length;
    let first = true;
    for (let i = 0; i < word.length; i += 4) {
      const chunk = (first && lead ? piece.slice(0, lead) : "") + word.slice(i, i + 4);
      out.push({ text: chunk, id: idFor(chunk), cont: !first });
      first = false;
    }
  }
  return out;
}

type Labels = {
  title: string;
  intro: string;
  input: string;
  placeholder: string;
  tokens: string;
  chars: string;
  note: string;
};

/** Tokenizer toy (PLAN §7.3 easter egg): an illustration, not a real model's vocabulary. */
export function Tokenizer({ labels, initial }: { labels: Labels; initial: string }) {
  const [text, setText] = useState(initial);
  const tokens = useMemo(() => tokenize(text), [text]);
  const inputId = useId();

  return (
    <div className={s.toy}>
      <label htmlFor={inputId} className={s.label}>
        {labels.input}
      </label>
      <textarea
        id={inputId}
        className={s.input}
        value={text}
        rows={3}
        placeholder={labels.placeholder}
        onChange={(e) => setText(e.target.value)}
      />
      <p className={s.stats} aria-live="polite">
        <strong className="mono">{tokens.length}</strong> {labels.tokens} ·{" "}
        <span className="mono">{text.length}</span> {labels.chars}
      </p>
      <ol className={s.tokens} aria-label={labels.tokens}>
        {tokens.map((t, i) => (
          <li key={`${i}-${t.id}`} className={s.token} data-alt={i % 2 === 1} data-cont={t.cont}>
            <span className={s.text}>{t.text.replace(/ /g, "·").replace(/\n/g, "↵")}</span>
            <span className={`mono ${s.id}`}>{t.id}</span>
          </li>
        ))}
      </ol>
      <p className={s.note}>{labels.note}</p>
    </div>
  );
}
