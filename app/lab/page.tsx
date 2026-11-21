import Link from "next/link";

const directions = [
  {
    href: "/lab/a/",
    name: "A · Línea",
    line: "Your work as a transit network: domains are lines, projects are stations.",
  },
];

export default function LabIndex() {
  return (
    <main
      style={{
        fontFamily: "Georgia, serif",
        maxWidth: "40rem",
        margin: "4rem auto",
        padding: "0 1rem",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "2rem" }}>Three directions for CP1</h1>
      <p>
        Each page shows the hero, a project card and body copy in that direction, then its type, palettes,
        contrast ratios and risks.
      </p>
      <ul>
        {directions.map((d) => (
          <li key={d.href} style={{ marginBottom: "1rem" }}>
            <Link href={d.href}>{d.name}</Link>
            <br />
            {d.line}
          </li>
        ))}
      </ul>
    </main>
  );
}
