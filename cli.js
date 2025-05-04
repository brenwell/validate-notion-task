const { Client } = require("@notionhq/client");
const { findPageByTaskId } = require("./index.js");

async function main(token, dbId, propertyName, id) {
  const notion = new Client({ auth: token });
  const res = await findPageByTaskId(notion, dbId, propertyName, id);
  console.log("Page exists:", res);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node cli.js <token> <id>");
  process.exit(1);
}

if (args.length < 2) {
  console.error("Error: Both token and id are required.");
  process.exit(1);
}

const [token, dbId, propertyName, id] = args;

main(token, dbId, propertyName, id);
