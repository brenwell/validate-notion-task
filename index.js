// .github/actions/validate-notion-task/index.js
const core = require("@actions/core");
const github = require("@actions/github");
const { Client } = require("@notionhq/client");

/**
 * Extracts the ticket ID from a branch name.
 * @param {string} branchName - The branch name.
 * @param {string} prefix - The prefix for the ticket ID.
 * @returns {number} The extracted ticket ID.
 */
function extractTicketIdFromBranchName(branchName, prefix) {
  // Escape any regex‐special chars in the prefix
  const safePrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Build a simple regex: look for PREFIX-<digits>
  const regex = new RegExp(`${safePrefix}-(\\d+)`, "i");
  const match = regex.exec(branchName);
  if (!match) {
    throw new Error(`Expected "${prefix}-<number>" in "${branchName}"`);
  }
  return Number(match[1]);
}

/**
 * Extracts the ticket ID from a pull request title.
 * @param {string} prTitle - The pull request title.
 * @param {string} prefix - The prefix for the ticket ID.
 * @returns {number} The extracted ticket ID.
 */
function extractTicketIdFromPrTitle(prTitle, prefix) {
  // Escape any regex‐special chars in the prefix
  const safePrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Build a regex to match ticket ID at the start of the title
  const regex = new RegExp(`^\\[?\\s*${safePrefix}-(\\d+)\\s*\\]?`, "i");
  const match = regex.exec(prTitle);
  if (!match) {
    throw new Error(
      `Expected "${prefix}-<number>" at the start of "${prTitle}"`
    );
  }
  return Number(match[1]);
}

/**
 * Finds a Notion page by its task ID in a specific database.
 * @param {string} notion - The Notion client instance.
 * @param {string} databaseId - The ID of the Notion database.
 * @param {string} property - The name of the property to search in.
 * @param {string} taskId - The task ID to search for.
 * @returns {Promise<object>} The found page object.
 */
async function findPageByTaskId(notion, databaseId, property, taskId) {
  // Query the database, filtering where the "unique_id" property equals our taskId
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property, // the name of your property in Notion
      number: { equals: Number(taskId) },
    },
    page_size: 1, // we only need the first match
  });

  if (response.results.length === 0) {
    throw new Error(`No page found with unique_id = ${taskId}`);
  }

  // return the first matching page object
  return response.results[0];
}

/**
 * Main function to validate the Notion task ID.
 * @param {string} token - The Notion API token.
 * @param {string} prefix - The prefix for the ticket ID.
 * @param {string} uniqueIdName - The name of the unique ID property in Notion.
 * @param {string} databaseId - The ID of the Notion database.
 * @param {string} branchName - The name of the branch.
 * @param {string} prTitle - The title of the pull request.
 */
async function main(
  token,
  prefix,
  uniqueIdName,
  databaseId,
  branchName,
  prTitle
) {
  try {
    if (!token) {
      core.setFailed("Notion token is required.");
      return;
    }

    const branchId = extractTicketIdFromBranchName(branchName, prefix);
    if (!branchId) {
      core.setFailed(
        `No valid ticket ID found in branch name (“${branchName}”).`
      );
      return;
    }

    const prId = extractTicketIdFromPrTitle(prTitle, prefix);
    if (!prId) {
      core.setFailed(`No valid ticket ID found in PR title (“${prTitle}”).`);
      return;
    }
    if (branchId !== prId) {
      core.setFailed(
        `Branch ID (${branchId}) and PR ID (${prId}) do not match.`
      );
      return;
    }

    const ticketId = branchId;

    const notion = new Client({ auth: token });

    // Check if the page exists in Notion
    const exists = await findPageByTaskId(
      notion,
      databaseId,
      uniqueIdName,
      uniqueId
    );
    if (!exists) {
      core.setFailed(`Notion page ${ticketId} does not exist.`);
      return;
    }

    core.info(`Found Notion page ${ticketId}. ✅`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

async function run() {
  const uniqueIdName = core.getInput("unique_id_name", { required: true });
  const prefix = core.getInput("prefix", { required: true });
  const databaseId = core.getInput("database_id", { required: true });
  const token = core.getInput("notion_token", { required: true });
  const pr = github.context.payload.pull_request;
  const branchName = pr.head.ref;
  const prTitle = pr.title;

  main(token, prefix, uniqueIdName, databaseId, branchName, prTitle);
}

// Export for unit tests
module.exports = {
  run,
  main,
  findPageByTaskId,
  extractTicketIdFromBranchName,
  extractTicketIdFromPrTitle,
};

if (require.main === module) {
  run();
}
