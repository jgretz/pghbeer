# Google Sheets access setup

The `google-sheets` package reads a private spreadsheet via the Sheets API v4
using a Google Cloud **service account**. Code alone is not enough — the
following human steps must be completed in the Google Cloud console, and the
target spreadsheet must be shared with the service account before any read will
succeed.

Target spreadsheet:
`https://docs.google.com/spreadsheets/d/1z72xbr5QMxGOAHYKL5rqRUVtLoVvmGNkceUqX5xgS7w/edit?gid=550756003`

## Operator checklist

1. - [ ] Create or select a Google Cloud project at
   <https://console.cloud.google.com/>.
2. - [ ] Enable the **Google Sheets API** for that project
   (APIs & Services → Library → "Google Sheets API" → Enable).
3. - [ ] Create a **service account** (IAM & Admin → Service Accounts → Create),
   then generate a **JSON key** for it (Keys → Add Key → Create new key → JSON)
   and download the key file. Note the service-account email (the
   auto-generated address ending in `.iam` for that project).
4. - [ ] Share the target spreadsheet — paste this URL —
   `https://docs.google.com/spreadsheets/d/1z72xbr5QMxGOAHYKL5rqRUVtLoVvmGNkceUqX5xgS7w/edit?gid=550756003`
   with the service-account email as **Viewer**.
5. - [ ] Set credentials via environment variables, using **exactly one** of the
   two supported shapes:
   - `GOOGLE_APPLICATION_CREDENTIALS` — absolute path to the downloaded
     service-account JSON key file, **or**
   - both `GOOGLE_SERVICE_ACCOUNT_EMAIL` (the service-account email) and
     `GOOGLE_PRIVATE_KEY` (the inline PEM private key from the JSON key).

> **`GOOGLE_PRIVATE_KEY` newline note:** in `.env`, the PEM value must be kept
> on a single line with its newlines escaped as literal `\n`. The package
> un-escapes `\n` back into real newlines at load time.

## Verify

Once the steps above are complete, run:

```bash
bun run test:sheet-access
```

It lists the spreadsheet's tab titles, resolves the target tab by `gid`, and
prints the first five rows of that tab. With no valid credentials it fails fast
with a readable error and a non-zero exit code.
