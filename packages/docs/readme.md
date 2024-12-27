
# Bun Nook Kit


![[BNK Logo.webp]]
**Bun Nook Kit (BNK)** is a comprehensive toolkit for software development, leveraging the power of Bun and TypeScript. With zero third-party dependencies, strong TypeScript inferencing, and a focus on Web API standards, BNK offers a modular, type-safe, and efficient way to build robust applications.

![GitHub License](https://img.shields.io/github/license/nookit-dev/bnkit)

![npm](https://img.shields.io/npm/v/bnkit?logo=npm)  ![GitHub release (with filter)](https://img.shields.io/github/v/release/nookit-dev/bnkit)  ![Stars](https://img.shields.io/github/stars/nookit-dev/bnkit) 
![npm bundle size](https://img.shields.io/bundlephobia/min/bnkit)  ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/bnkit)

![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/bun_nook_kit)  ![Discord](https://img.shields.io/discord/1164699087543746560) 
## Quickstart
  
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/nookit-dev/bnkit/main/scripts/quickstart.sh)
```
After you run the quickstart script it'll prompt you with the code to add to your zshrc/bashrc, this CLI script will point to the latest version of bnkit when using the CLI

## [Optional - CLI Install Instructions](bnk-cli/bnk-cli-readme.md)

# [View Bun Nook Kit Modules](modules.md)
Bun Nook Kit has a variety of module to help you build any web based application from a CLI to a fullstack web server. Plug the modules into an existing project as long as you can run Bun, or start your next project entirely on BNK and experience a much simpler development experience. 

## [Bun Nook Kit Project GitHub](https://github.com/nookit-dev/bnkit)


## Key Features

- **Zero Third-Party Dependencies**: BNK relies solely on [Bun](https://bun.sh), ensuring lightweight and efficient operation.
- **Strong TypeScript Type Inferencing**: Enhances code reliability and eases development with powerful type support.
- **Modular Design**: Provides flexibility to use only what you need for your project.
- **Web API Standards**: Ensures broad compatibility and future-proofing.

## Stop Analysis Paralysis and Start Building
The goal of BNK is to provide a set of tools in which a developer can rapidly develop full-stack interactive JavaScript application with no additional dependencies, BNK relies on nothing but the APIs provided by Bun. Bun is now on >1.0 and is stable and as such BNK is focusing on providing a stable 1.0 release to lock in the APIs.


### Use What You need
#### Build a full stack server with templating:
Example of how you use the following modules to build out a full stack server
- [Server Module](readmes/server.md)   handle the application business logic - generate webpages on the server with...
- [HTMLody Module](readmes/htmlody.md) HTML templating with JSON object syntax. With a Tailwind-like CSS utility library!
- [SQLite Module](readmes/sqlite.md) store permanent data!
- [Auth Module](readmes/auth.md) - If your application requires it!

## Community

Join our [Discord Server](https://discord.gg/rQyWN7V6) for support, discussions, and updates.

## Screenshots

An HTMLody component, as well the TypeScript inference abilities as all the types shown in the in intellisense were inferred from the SQLite schema configured for the user subscription.

<img width="656" alt="Xnapper-2023-11-15-00 26 10" src="https://github.com/nookit-dev/bnkit-docs/assets/18100375/70dc6060-4897-4603-b027-e3f81076738d">

The next two screenshots show how easy it can be to create and start a server - even with middleware with great type inference.

<img width="555" alt="Xnapper-2023-11-14-19 43 47" src="https://github.com/nookit-dev/bnkit/assets/18100375/0d66c9ec-0f3a-487c-98f8-8c14faeaa82d">

<img width="582" alt="Xnapper-2023-11-14-19 47 14" src="https://github.com/nookit-dev/bnkit/assets/18100375/78afc0e7-46c0-4269-8072-e8622f111b08">

Lastly, an example showing direct importing from the htmlody module.

<img width="478" alt="Xnapper-2023-11-14-19 51 14" src="https://github.com/nookit-dev/bnkit/assets/18100375/9a70c8fa-a88a-48fc-95de-6c8dbadcb047">

For those on GitHub:
### [View Interactive Docs - Nookit.dev](https://nookit.dev/)
## License

BNK is available under the MIT License - free for personal and commercial use.

---

Bun Nook Kit - An attempt at keeping developers out of dependency hell.

Contribute to The Docs:
[Bun Nook Kit Docs GitHub](https://github.com/nookit-dev/bnkit-docs)

