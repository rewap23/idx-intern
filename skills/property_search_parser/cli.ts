import { parsePropertyQuery } from "./parser.ts";

let query = process.argv.slice(2).join(" ");
if (!query) {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  query = Buffer.concat(chunks).toString("utf8");
}
query = query.trim();
if (!query) {
  console.error("usage: node cli.ts \"your query\"   (or pipe the query on stdin)");
  process.exit(1);
}
console.log(JSON.stringify(parsePropertyQuery(query)));
