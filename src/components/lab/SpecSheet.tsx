import { contrastRatio, wcagLevel } from "@/lib/contrast";
import styles from "./spec-sheet.module.css";

export type Swatch = { name: string; hex: string; role: string };
export type Pair = { fg: string; bg: string; use: string };
export type FontSpec = { role: string; family: string; license: string; href: string };

export type Spec = {
  name: string;
  mood: string;
  fonts: FontSpec[];
  light: Swatch[];
  dark: Swatch[];
  pairs: Pair[];
  ambient: string;
  cursor: string;
  signature: string;
  risk: string;
  critique?: string[];
};

function ContrastTable({ swatches, pairs, caption }: { swatches: Swatch[]; pairs: Pair[]; caption: string }) {
  const hex = (name: string) => {
    const s = swatches.find((x) => x.name === name);
    if (!s) throw new Error(`Spec pair references unknown swatch "${name}"`);
    return s.hex;
  };
  return (
    <table className={styles.table}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Use</th>
          <th scope="col">Text on ground</th>
          <th scope="col">Ratio</th>
          <th scope="col">WCAG</th>
        </tr>
      </thead>
      <tbody>
        {pairs.map((p) => {
          const ratio = contrastRatio(hex(p.fg), hex(p.bg));
          const level = wcagLevel(ratio);
          return (
            <tr key={`${p.fg}-${p.bg}-${p.use}`}>
              <th scope="row">{p.use}</th>
              <td>
                <span className={styles.sample} style={{ color: hex(p.fg), background: hex(p.bg) }}>
                  Aa
                </span>{" "}
                {p.fg} on {p.bg}
              </td>
              <td className={styles.num}>{ratio.toFixed(2)}:1</td>
              <td data-level={level}>{level}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Swatches({ swatches, label }: { swatches: Swatch[]; label: string }) {
  return (
    <ul className={styles.swatches} aria-label={label}>
      {swatches.map((s) => (
        <li key={s.name}>
          <span className={styles.chip} style={{ background: s.hex }} aria-hidden="true" />
          <span>
            <strong>{s.name}</strong> <code>{s.hex}</code>
            <br />
            {s.role}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The proposal sheet under each /lab direction: what Noel is choosing at CP1 (PLAN.md §8.1). */
export function SpecSheet({ spec, className }: { spec: Spec; className?: string }) {
  return (
    <section id="spec" className={`${styles.sheet} ${className ?? ""}`} aria-labelledby="spec-title">
      <h2 id="spec-title">Proposal: {spec.name}</h2>
      <p className={styles.mood}>{spec.mood}</p>

      <h3>Type</h3>
      <ul className={styles.fonts}>
        {spec.fonts.map((f) => (
          <li key={f.role}>
            <strong>{f.role}:</strong> {f.family} (
            <a href={f.href} target="_blank" rel="noreferrer">
              {f.license}
            </a>
            ), self-hosted at build time
          </li>
        ))}
      </ul>

      <div className={styles.palettes}>
        <div>
          <h3>Light palette</h3>
          <Swatches swatches={spec.light} label="Light palette" />
          <ContrastTable swatches={spec.light} pairs={spec.pairs} caption="Light contrast" />
        </div>
        <div>
          <h3>Dark palette</h3>
          <Swatches swatches={spec.dark} label="Dark palette" />
          <ContrastTable swatches={spec.dark} pairs={spec.pairs} caption="Dark contrast" />
        </div>
      </div>

      <dl className={styles.notes}>
        <dt>Ambient background</dt>
        <dd>{spec.ambient}</dd>
        <dt>Cursor</dt>
        <dd>{spec.cursor}</dd>
        <dt>Signature interaction</dt>
        <dd>{spec.signature}</dd>
        <dt>Honest risk</dt>
        <dd>{spec.risk}</dd>
      </dl>

      {spec.critique && (
        <>
          <h3>Critique</h3>
          <ul className={styles.critique}>
            {spec.critique.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
