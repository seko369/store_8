# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## End-to-end tests

Playwright tests run against the real Docker Compose application through Caddy; they do not start Vite or mock the API. Start the stack from the repository root before running them:

```sh
DOMAIN=localhost HTTP_PORT=8080 HTTPS_PORT=443 \
  CORS_ORIGINS=https://localhost COOKIE_SECURE=true \
  docker compose up -d
docker compose ps
```

Set local admin credentials in the shell (do not commit them), then run:

```sh
cd frontend
E2E_ADMIN_EMAIL='admin@example.com' E2E_ADMIN_PASSWORD='your-local-admin-password' npm run e2e
```

The default base URL is `https://localhost`, matching the local Caddy TLS setup. For a different deployed local proxy URL, set `E2E_BASE_URL`. The browser accepts the local Caddy certificate for this test run only; this is not public certificate verification. Install the Chromium browser once with `npx playwright install chromium`, and optionally run `npm run e2e:check` to type-check the E2E sources.

Vitest remains the component/integration test runner. Playwright reports and failure artifacts are written under `playwright-report/` and `test-results/`, both ignored by Git.
