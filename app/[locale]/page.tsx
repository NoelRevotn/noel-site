// Phase 0 placeholder: proves the build → deploy pipeline. Phase 2 replaces it with the section registry.
const copy = {
  en: { heading: "Noel Echeverría", body: "Site under construction." },
  es: { heading: "Noel Echeverría", body: "Sitio en construcción." },
} as const;

export default async function Home({ params }: { params: Promise<{ locale: "en" | "es" }> }) {
  const { locale } = await params;
  const t = copy[locale];
  return (
    <main>
      <h1>{t.heading}</h1>
      <p>{t.body}</p>
    </main>
  );
}
