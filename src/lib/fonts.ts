import { Archivo, Atkinson_Hyperlegible_Next, Azeret_Mono } from "next/font/google";

// Self-hosted at build time (OFL). Licences: docs/DESIGN.md.
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
export const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});
export const azeret = Azeret_Mono({ subsets: ["latin"], variable: "--font-azeret", display: "swap" });

export const fontVariables = `${archivo.variable} ${atkinson.variable} ${azeret.variable}`;
