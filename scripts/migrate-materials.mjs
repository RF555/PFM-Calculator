import fs from "node:fs";

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const src = JSON.parse(fs.readFileSync("src/data/materials.json", "utf8"));

const materials = src.map((m) => {
  const id = slug(m.name);
  // Materials with no subtypes get a single grade carrying the parent density,
  // so the removed parent field loses no information.
  const grades = m.subtypes.length
    ? m.subtypes.map((s) => ({
        id: `${id}.${slug(s.name)}`,
        name: s.name,
        density: s.density,
      }))
    : [{ id: `${id}.standard`, name: "Standard", density: m.density }];
  return { id, name: m.name, grades };
});

fs.mkdirSync("src/calculator/data", { recursive: true });
fs.writeFileSync(
  "src/calculator/data/materials.json",
  JSON.stringify({ version: 1, materials }, null, 2) + "\n"
);

const total = materials.reduce((a, m) => a + m.grades.length, 0);
console.log(`${materials.length} materials, ${total} grades`);
