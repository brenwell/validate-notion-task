const { Client } = require("@notionhq/client");
const { findPageByTaskId } = require("./index.js");

async function main(token, id) {
  const databaseId = "1e3f751bad898046b7b9d36f3eae3fed";
  const notion = new Client({ auth: token });
  const res = await findPageByTaskId(notion, databaseId, id);
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

const [token, id] = args;

main(token, id);
