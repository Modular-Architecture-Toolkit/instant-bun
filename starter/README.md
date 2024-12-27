# BNK Server Starter Template

## Quick start

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/brandon-schabel/bun-nook-kit/main/scripts/quickstart.sh)
```

you can pass in a `-p` flag followed by a desired folder name to pass the custom name directly to the command.

The above commands/script will create a template from the file and run a setup script to install bun if it's not already installed, install dependencies(bun/bun-types packages). Then it will start the server and open the browser.

## Manual setup

```bash
bun create github.com/brandon-schabel/bnk-server-starter
```

```bash
cd bnk-server-start

```

```bash
bun install
```

```bash
bun dev
```

Dev server default port 3000, link: [`http://localhost:3000`](http://localhost:3000)

Visit `http://localhost:3000` in your browser and you should see Hello world and
`http://localhost:3000/json` for the json

# [Bun Nookit Docs](https://nookit.dev/readme)

## [BNK Server Docs](https://nookit.dev/readmes/server)

## Handle Form Data

```typescript
const routes = {
  // ... other routes
  '/poll': {
    post: async (request) => {
      const form = await request.formData()

      const firstName = form.get('firstName')
      const lastName = form.get('lastName')

      /// do something with the data

      return new Response(`Thank you ${firstName} for taking the poll!`)
    },
  },
}
```

Middleware type inference in route config:
<img width="736" alt="Xnapper-2023-11-22-19 51 56" src="https://github.com/brandon-schabel/start-bnk/assets/18100375/420342b0-e1f2-4c70-8019-32b1023d2b3d">
