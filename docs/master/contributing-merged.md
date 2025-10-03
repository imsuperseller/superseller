

---
# From: CONTRIBUTING.md
---

# Developing

We welcome contributions to all of our MCP servers! Here's a quick run down on how to get started.

## Architecture

This monorepo has two top-level directories: `/apps` and `/packages`.

- **/apps**: Containing directories for each server. Within each server, you'll find a `CONTRIBUTING.md` with any special instructions on how to get set up:
  - [apps/workers-observability](apps/workers-observability)
  - [apps/workers-bindings](apps/workers-bindings)
  - [apps/radar](apps/radar)
  - [apps/cloudflare-one-casb](apps/cloudflare-one-casb)
- **/packages**: Containing shared packages used across our various apps.
  - packages/eslint-config: Eslint config used by all apps and packages.
  - packages/typescript-config: tsconfig used by all apps and packages.
  - packages/mcp-common: Shared common tools and scripts to help manage this repo.

We use [TurboRepo](https://turbo.build/) and [pnpm](https://pnpm.io/) to manage this repository. TurboRepo manages the monorepo by ensuring commands are run across all apps.

## Getting Started

This section will guide you through setting up your developer environment and running tests.

### Installation

Install dependencies:

```bash
pnpm install
```

### Testing

The project uses Vitest as the testing framework with [fetchMock](https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/) for API mocking.

#### Running Tests

To run all tests:

```bash
pnpm test
```

To run a specific test file:

```bash
pnpm test -- tests/tools/queues.test.ts
```

To run tests in watch mode (useful during development):

```bash
pnpm test:watch
```


---
# From: CONTRIBUTING.md
---

# Setup

If you'd like to iterate and test your MCP server, you can do so in local development.

## Local Development

1. Create a `.dev.vars` file in your project root:

   If you're a Cloudflare employee:

   ```
   CLOUDFLARE_CLIENT_ID=your_development_cloudflare_client_id
   CLOUDFLARE_CLIENT_SECRET=your_development_cloudflare_client_secret
   ```

   If you're an external contributor, you can provide a development API token:

   ```
   DEV_DISABLE_OAUTH=true
   # This is your global api token
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

2. Start the local development server:

   ```bash
   npx wrangler dev
   ```

3. To test locally, open Inspector, and connect to `http://localhost:8976/sse`.
   Once you follow the prompts, you'll be able to "List Tools". You can also connect with any MCP client.

## Deploying the Worker ( Cloudflare employees only )

Set secrets via Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_CLIENT_ID -e <ENVIRONMENT>
npx wrangler secret put CLOUDFLARE_CLIENT_SECRET -e <ENVIRONMENT>
```

## Set up a KV namespace

Create the KV namespace:

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Then, update the Wrangler file with the generated KV namespace ID.

## Deploy & Test

Deploy the MCP server to make it available on your workers.dev domain:

```bash
npx wrangler deploy -e <ENVIRONMENT>
```

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
npx @modelcontextprotocol/inspector@latest
```


---
# From: CONTRIBUTING.md
---

# Setup

If you'd like to iterate and test your MCP server, you can do so in local development.

## Local Development

1. Create a `.dev.vars` file in your project root:

   If you're a Cloudflare employee:

   ```
   CLOUDFLARE_CLIENT_ID=your_development_cloudflare_client_id
   CLOUDFLARE_CLIENT_SECRET=your_development_cloudflare_client_secret
   ```

   If you're an external contributor, you can provide a development API token:

   ```
   DEV_DISABLE_OAUTH=true
   # This is your global api token
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

2. Start the local development server:

   ```bash
   npx wrangler dev
   ```

3. To test locally, open Inspector, and connect to `http://localhost:8976/sse`.
   Once you follow the prompts, you'll be able to "List Tools". You can also connect with any MCP client.

## Deploying the Worker ( Cloudflare employees only )

Set secrets via Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_CLIENT_ID -e <ENVIRONMENT>
npx wrangler secret put CLOUDFLARE_CLIENT_SECRET -e <ENVIRONMENT>
npx wrangler secret put URL_SCANNER_API_TOKEN -e <ENVIRONMENT>
```

## Set up a KV namespace

Create the KV namespace:

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Then, update the Wrangler file with the generated KV namespace ID.

## Deploy & Test

Deploy the MCP server to make it available on your workers.dev domain:

```bash
npx wrangler deploy -e <ENVIRONMENT>
```

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
npx @modelcontextprotocol/inspector@latest
```


---
# From: CONTRIBUTING.md
---

# Setup

If you'd like to iterate and test your MCP server, you can do so in local development.

## Local Development

1. Create a `.dev.vars` file in your project root:

   If you're a Cloudflare employee:

   ```
   CLOUDFLARE_CLIENT_ID=your_development_cloudflare_client_id
   CLOUDFLARE_CLIENT_SECRET=your_development_cloudflare_client_secret
   ```

   If you're an external contributor, you can provide a development API token:

   ```
   DEV_DISABLE_OAUTH=true
   # This is your global api token
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

2. Start the local development server:

   ```bash
   npx wrangler dev
   ```

3. To test locally, open Inspector, and connect to `http://localhost:8976/sse`.
   Once you follow the prompts, you'll be able to "List Tools". You can also connect with any MCP client.

## Deploying the Worker ( Cloudflare employees only )

Set secrets via Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_CLIENT_ID -e <ENVIRONMENT>
npx wrangler secret put CLOUDFLARE_CLIENT_SECRET -e <ENVIRONMENT>
```

## Set up a KV namespace

Create the KV namespace:

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Then, update the Wrangler file with the generated KV namespace ID.

## Deploy & Test

Deploy the MCP server to make it available on your workers.dev domain:

```bash
npx wrangler deploy -e <ENVIRONMENT>
```

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
npx @modelcontextprotocol/inspector@latest
```


---
# From: CONTRIBUTING.md
---

# Setup

If you'd like to iterate and test your MCP server, you can do so in local development.

## Local Development

1. Create a `.dev.vars` file in your project root:

   If you're a Cloudflare employee:

   ```
   CLOUDFLARE_CLIENT_ID=your_development_cloudflare_client_id
   CLOUDFLARE_CLIENT_SECRET=your_development_cloudflare_client_secret
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

   If you're an external contributor, you can provide a development API token (See [Cloudflare API](https://developers.cloudflare.com/api/) for information on creating an API Token):

   ```
   DEV_DISABLE_OAUTH=true
   DEV_CLOUDFLARE_EMAIL=your_cloudflare_email
   # This is your api token with endpoint access.
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

2. Start the local development server:

   ```bash
   npx wrangler dev
   ```

3. To test locally, open Inspector, and connect to `http://localhost:8976/sse`.
   Once you follow the prompts, you'll be able to "List Tools". You can also connect with any MCP client.

## Deploying the Worker ( Cloudflare employees only )

Set secrets via Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_CLIENT_ID -e <ENVIRONMENT>
npx wrangler secret put CLOUDFLARE_CLIENT_SECRET -e <ENVIRONMENT>
```

## Set up a KV namespace

Create the KV namespace:

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Then, update the Wrangler file with the generated KV namespace ID.

## Deploy & Test

Deploy the MCP server to make it available on your workers.dev domain:

```bash
npx wrangler deploy -e <ENVIRONMENT>
```

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
npx @modelcontextprotocol/inspector@latest
```


---
# From: CONTRIBUTING.md
---

# Setup

If you'd like to iterate and test your MCP server, you can do so in local development.

## Local Development

1. Create a `.dev.vars` file in your project root:

   If you're a Cloudflare employee:

   ```
   CLOUDFLARE_CLIENT_ID=your_development_cloudflare_client_id
   CLOUDFLARE_CLIENT_SECRET=your_development_cloudflare_client_secret
   ```

   If you're an external contributor, you can provide a development API token:

   ```
   DEV_DISABLE_OAUTH=true
   DEV_CLOUDFLARE_EMAIL=your_cloudflare_email
   # This is your global api token
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

2. Start the local development server:

   ```bash
   npx wrangler dev
   ```

3. To test locally, open Inspector, and connect to `http://localhost:8976/sse`.
   Once you follow the prompts, you'll be able to "List Tools". You can also connect with any MCP client.

## Deploying the Worker ( Cloudflare employees only )

Set secrets via Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_CLIENT_ID -e <ENVIRONMENT>
npx wrangler secret put CLOUDFLARE_CLIENT_SECRET -e <ENVIRONMENT>
```

## Set up a KV namespace

Create the KV namespace:

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Then, update the Wrangler file with the generated KV namespace ID.

## Deploy & Test

Deploy the MCP server to make it available on your workers.dev domain:

```bash
npx wrangler deploy -e <ENVIRONMENT>
```

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
npx @modelcontextprotocol/inspector@latest
```


---
# From: CONTRIBUTING.md
---

# Container MCP Server

This is a simple MCP-based interface for a sandboxed development environment.

## Local dev

Cloudchamber local dev isn't implemented yet, so we are doing a bit of a hack to just run the server in your local environment. Because of this, testing the container(s) and container manager locally is not possible at this time.

Do the following from within the sandbox-container app:

1. Copy the `.dev.vars.example` file to a new `.dev.vars` file.
2. Get the Cloudflare client id and secret from a team member and add them to the `.dev.vars` file.
3. Run `pnpm i` then `pnpm dev` to start the MCP server.
4. Run `pnpx @modelcontextprotocol/inspector` to start the MCP inspector client.
5. Open the inspector client in your browser and connect to the server via `http://localhost:8976/sse`.

Note: Temporary files created through files tool calls are stored in the workdir folder of this app.

## Deploying

1. Make sure the docker daemon is running

2. Disable WARP and run

```
npx https://prerelease-registry.devprod.cloudflare.dev/workers-sdk/runs/14387504770/npm-package-wrangler-8740 deploy
```

3. Add to your Claude config. If using with Claude, you'll need to disable WARP:

```
{
    "mcpServers": {
        "container": {
            "command": "npx",
            "args": [
                "mcp-remote",
                // this is my deployed instance
                "https://container-starter-2.cmsparks.workers.dev/sse"
            ]
        }
    }
}
```


---
# From: CONTRIBUTING.md
---

# Setup

If you'd like to iterate and test your MCP server, you can do so in local development.

## Local Development

1. Create a `.dev.vars` file in your project root:

   If you're a Cloudflare employee:

   ```
   CLOUDFLARE_CLIENT_ID=your_development_cloudflare_client_id
   CLOUDFLARE_CLIENT_SECRET=your_development_cloudflare_client_secret
   ```

   If you're an external contributor, you can provide a development API token:

   ```
   DEV_DISABLE_OAUTH=true
   DEV_CLOUDFLARE_EMAIL=your_cloudflare_email
   # This is your global api token
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

2. Start the local development server:

   ```bash
   npx wrangler dev
   ```

3. To test locally, open Inspector, and connect to `http://localhost:8976/sse`.
   Once you follow the prompts, you'll be able to "List Tools". You can also connect with any MCP client.

## Deploying the Worker ( Cloudflare employees only )

Set secrets via Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_CLIENT_ID -e <ENVIRONMENT>
npx wrangler secret put CLOUDFLARE_CLIENT_SECRET -e <ENVIRONMENT>
```

## Set up a KV namespace

Create the KV namespace:

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Then, update the Wrangler file with the generated KV namespace ID.

## Deploy & Test

Deploy the MCP server to make it available on your workers.dev domain:

```bash
npx wrangler deploy -e <ENVIRONMENT>
```

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
npx @modelcontextprotocol/inspector@latest
```


---
# From: CONTRIBUTING.md
---

# Setup

If you'd like to iterate and test your MCP server, you can do so in local development.

## Local Development

1. Create a `.dev.vars` file in your project root:

   If you're a Cloudflare employee:

   ```
   CLOUDFLARE_CLIENT_ID=your_development_cloudflare_client_id
   CLOUDFLARE_CLIENT_SECRET=your_development_cloudflare_client_secret
   ```

   If you're an external contributor, you can provide a development API token:

   ```
   DEV_DISABLE_OAUTH=true
   DEV_CLOUDFLARE_EMAIL=your_cloudflare_email
   # This is your global api token
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

2. Start the local development server:

```bash
pnpm dev
```

3. To test locally, open Inspector, and connect to `http://localhost:8976/sse`.
   Once you follow the prompts, you'll be able to "List Tools". You can also connect with any MCP client.

## Deploying the Worker ( Cloudflare employees only )

Set secrets via Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_CLIENT_ID -e <ENVIRONMENT>
npx wrangler secret put CLOUDFLARE_CLIENT_SECRET -e <ENVIRONMENT>
```

## Set up a KV namespace

Create the KV namespace:

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Then, update the Wrangler file with the generated KV namespace ID.

## Deploy & Test

Deploy the MCP server to make it available on your workers.dev domain:

```bash
npx wrangler deploy -e <ENVIRONMENT>
```

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
npx @modelcontextprotocol/inspector@latest
```


---
# From: CONTRIBUTING.md
---

# Setup

If you'd like to iterate and test your MCP server, you can do so in local development.

## Local Development

1. Create a `.dev.vars` file in your project root:

   If you're a Cloudflare employee:

   ```
   CLOUDFLARE_CLIENT_ID=your_development_cloudflare_client_id
   CLOUDFLARE_CLIENT_SECRET=your_development_cloudflare_client_secret
   ```

   If you're an external contributor, you can provide a development API token:

   ```
   DEV_DISABLE_OAUTH=true
   DEV_CLOUDFLARE_EMAIL=your_cloudflare_email
   # This is your global api token
   DEV_CLOUDFLARE_API_TOKEN=your_development_api_token
   ```

2. Start the local development server:

   ```bash
   npx wrangler dev
   ```

3. To test locally, open Inspector, and connect to `http://localhost:8976/sse`.
   Once you follow the prompts, you'll be able to "List Tools". You can also connect with any MCP client.

## Deploying the Worker ( Cloudflare employees only )

Set secrets via Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_CLIENT_ID -e <ENVIRONMENT>
npx wrangler secret put CLOUDFLARE_CLIENT_SECRET -e <ENVIRONMENT>
```

## Set up a KV namespace

Create the KV namespace:

```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Then, update the Wrangler file with the generated KV namespace ID.

## Deploy & Test

Deploy the MCP server to make it available on your workers.dev domain:

```bash
npx wrangler deploy -e <ENVIRONMENT>
```

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
npx @modelcontextprotocol/inspector@latest
```
