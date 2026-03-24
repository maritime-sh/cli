# Maritime CLI

Command-line tool for [Maritime](https://maritime.sh) — deploy and manage AI agents from your terminal.

## Install

```bash
npm install -g @anthropic-ai/maritime-cli
```

Or run directly with npx:

```bash
npx @anthropic-ai/maritime-cli status
```

## Quick Start

```bash
# Authenticate with your API key
maritime login --key mk_your_api_key

# Create a new agent config
maritime init --name my-agent

# Deploy
maritime deploy

# Check status
maritime status
```

## Authentication

Generate an API key from your [Maritime dashboard](https://maritime.sh/settings/api-keys), then:

```bash
maritime login --key mk_...
```

Alternatively, set the `MARITIME_API_KEY` environment variable for CI/CD:

```bash
export MARITIME_API_KEY=mk_...
maritime status
```

## Commands

### `maritime login`

Store your API key locally.

```bash
maritime login --key mk_...
echo mk_... | maritime login    # pipe from stdin
```

### `maritime logout`

Remove the stored API key.

### `maritime whoami`

Show the current API key prefix and API URL.

### `maritime init`

Generate a `maritime.toml` configuration file in the current directory.

```bash
maritime init
maritime init --name my-agent
```

### `maritime deploy`

Deploy an agent from `maritime.toml`. Creates the agent if it doesn't exist, redeploys if it does.

```bash
maritime deploy
maritime deploy --dir ./my-project
```

### `maritime status [agent]`

List all agents, or show details for a specific agent.

```bash
maritime status              # list all
maritime status my-agent     # detail view
```

### `maritime logs <agent>`

View agent logs.

```bash
maritime logs my-agent
maritime logs my-agent -n 100       # last 100 lines
maritime logs my-agent -l error     # errors only
maritime logs my-agent -f           # follow (poll)
```

### `maritime start <agent>`

Start a stopped agent.

### `maritime stop <agent>`

Stop a running agent.

### `maritime restart <agent>`

Restart an agent.

### `maritime destroy <agent>`

Delete an agent and all its resources. Prompts for confirmation unless `-y` is passed.

```bash
maritime destroy my-agent
maritime destroy my-agent -y    # skip confirmation
```

### `maritime env`

Manage environment variables.

```bash
maritime env list my-agent
maritime env set my-agent API_KEY=sk-123
maritime env set my-agent SECRET=val --secret
maritime env remove my-agent API_KEY
```

### `maritime deployments <agent>`

Show deployment history.

```bash
maritime deployments my-agent
maritime deployments my-agent -n 20
```

## Configuration File

`maritime.toml` defines your agent:

```toml
name = "my-agent"
framework = "auto"          # auto | crewai | langgraph | openclaw | docker
# image = "my-image:latest" # custom Docker image
# repo = "https://github.com/user/repo"
# branch = "main"
tier = "smart"              # smart | fast

[env]
API_KEY = "your-key"
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MARITIME_API_KEY` | API key (overrides stored key) |
| `MARITIME_API_URL` | API base URL (default: `https://api.maritime.sh`) |

## License

MIT
