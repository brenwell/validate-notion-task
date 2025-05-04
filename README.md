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
      - uses: actions/checkout@v3

      - name: Validate Notion Task
        uses: your-org/validate-notion-task@v1
        with:
          notion_token: ${{ secrets.NOTION_TOKEN }}
          database_id: ${{ secrets.NOTION_DATABASE_ID }}
          prefix: "AWT"
          unique_id_name: "Task ID"
```
