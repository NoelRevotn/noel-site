/** Motion tokens for JS animation (Motion). Mirrors the CSS custom properties in src/styles/tokens.css. */
export const duration = { instant: 0.08, fast: 0.16, base: 0.24, slow: 0.4 } as const;

export const ease = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.16, 1, 0.3, 1],
  exit: [0.3, 0, 1, 1],
} as const;

export const stagger = 0.06;
export const distance = { small: 8, medium: 16, large: 32 } as const;
