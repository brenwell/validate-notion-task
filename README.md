# Validate Notion Task GitHub Action

A GitHub Action that enforces your branch name and PR title include a valid Notion task ID, and verifies the page exists in your Notion database.

## Features

- Ensures every branch name contains `<PREFIX>-<NUMBER>` (anywhere).
- Ensures every PR title begins with `[<PREFIX>-<NUMBER>]`.
- Confirms the extracted numeric ID exists in a specified Notion database property.
- Fails early with clear error messages if validation or lookup fails.

---

## Inputs

| Name             | Required | Description                                                                                          |
| ---------------- | :------: | ---------------------------------------------------------------------------------------------------- |
| `notion_token`   |   yes    | **Secret**: your Notion integration token (e.g. `secret_NOTION_TOKEN`).                              |
| `database_id`    |   yes    | The Notion database ID to query (copy from your Notion URL or API).                                  |
| `prefix`         |   yes    | The ticket prefix to look for (e.g. `AWT` for IDs like `AWT-123`).                                   |
| `unique_id_name` |   yes    | The name of the **number** property in your Notion database that holds the task ID (e.g. `Task ID`). |

---

## Usage

```yaml
name: "Validate Notion Task"

on:
  pull_request:
    types: [opened, edited, reopened, synchronize]

jobs:
  validate-notion:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate Notion Task
        uses: brenwell/validate-notion-task@v1
        with:
          notion_token: ${{ secrets.NOTION_TOKEN }}
          database_id: ${{ secrets.NOTION_DATABASE_ID }}
          prefix: "AWT"
          unique_id_name: "Task ID"
```

## Testing Locally

You can test the logic locally by running the CLI script provided in the repository. For example:

```bash
node cli.js <api_key> <database_id> <property_name> <id>

e.g.

node cli.js secret_NOTION_TOKEN abc12345-6789-0def-ghij-klmnopqrstuv "Task ID" 174
```

Replace `<api_key>` with your Notion integration token, `'Task ID'` with the name of the numeric property in your Notion database, and `174` with the task ID you want to validate. This will simulate the validation process and output the results directly in your terminal.
