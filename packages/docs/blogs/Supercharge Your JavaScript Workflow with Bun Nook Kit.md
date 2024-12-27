# Supercharge Your JavaScript Workflow with Bun Nook Kit
### A zero added dependency toolkit built entirely on Bun
![[Pasted image 20231124081432.png]]
- Photo by [Luke Ellis-Craven](https://unsplash.com/@lukeelliscraven?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=medium&utm_medium=referral)

**One** of my favorite quotes i've heard while writing software is the [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle) - "Keep it simple...", I'll let you fill in the last part.  I think most would agree that the general JavaScript/TS workflow is often times a recipe for frustration. It's only a matter of time before a CI is as slow as a snail coming to a crippling hault cause because of some dependency error. Bun Nook Kit aims to simplify workflows by providing a selection of modules built entirely on [Bun](https://bun.sh). Bun Nook Kit(BNK) is not a framework, it builds solely on top of Bun by providing a rich set of modules, a bash CLI to get started quickly, strong documentation, deep TypeScript implementation, zero additional dependencies, no build steps, JS/TS interop, and it's easy to get started.

Create your first BNK server with a bash script:
- Please note it will ask to create a project folder and start a server on port 3000
```shell
bash <(curl -fsSL https://raw.githubusercontent.com/nookit-dev/bnkit/main/scripts/quickstart.sh)
```

![[bnk-quickstart.gif]]****

This will get you started with a basic BNK server, so you can start building. A great next step is to see what the server is capable of by reading the [server docs](https://nookit.dev/readmes/server)This will provide information on configuring type-safe routes, middleware, as well as links to related modules. I'd also highly recommend from there checkout the server usage docs. 

# Open Source and [MIT Licensed](https://en.wikipedia.org/wiki/MIT_License)
Open source has defined my career in software, [FreeCodeCamp](https://www.freecodecamp.org/) for example was a huge contributor to my forte in software. In the same spirit of FreeCodeCamp and Bun the least I could do is open source BNK which is how it was from the beginning and always will be. 

# [Documentation](https://nookit.dev/readme)
Effective documentation is a cornerstone of the Bun Nook Kit (BNK) project. My aim for the initial release (v1) is to ensure that every public-facing module API is thoroughly documented, complete with practical examples to enhance understanding. Currently, the documentation is published through Obsidian Publish as, given its user-friendly interface and robust features out of the box. Recognizing the dynamic nature of development, we are deeply committed to continuous improvement and actively seek community feedback. Should you find any aspect of our documentation unclear or have suggestions for enhancements, please do not hesitate to open an issue in the docs repo or by submitting a PR. By providing detailed guidance and clear examples, we strive to make your experience with BNK as smooth and productive as possible.

# [Modules](https://nookit.dev/modules)
![[Pasted image 20231124081543.png]]
- Photo by [Raphael Koh](https://unsplash.com/@dreamevile?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=medium&utm_medium=referral)

The development of Bun Nook Kit (BNK) modules embodies a philosophy of modular independence, ensuring that each component remains as self-contained as possible. This approach is fundamental in preventing excessive interdependencies within the BNK ecosystem. Each module that will be part of the v1 release will have a comprehensive set of unit tests, documentation, proper typescript and more. From server management and authentication to data generation and state management, without imposing reliance on other BNK modules. This design principle not only enhances the stability and scalability of individual modules but also facilitates their integration into diverse projects. By offering these standalone modules, BNK does not aspire to be the ultimate solution for every need; instead, it aims to provide a robust and versatile foundation that projects can seamlessly plug into. Existing projects can leverage these modules to enrich their functionality, while new endeavors can use them as building blocks, all without the overhead of external dependencies. In essence, BNK's module strategy is about offering flexibility and strength, enabling developers to tailor solutions that precisely fit their unique requirements. 

## Stacks
The [Payments Stack](https://github.com/brandon-schabel/bnk-payments-stack)project takes BNK and configures stripe a long with it, with stripe being the only external dependency. The stack handles data storage [BNKs SQLite module](https://nookit.dev/readmes/sqlite) that is built on top of [Bun's SQLite API](https://bun.sh/docs/api/sqlite), BNK provides an API for defining SQLite schemas and inferring the types from said schema. When you create a schema you get a factory function in return that will be typed according to that schema so you can do TypeSafe CRUD operations to permanent storage right out of the box.

![[Pasted image 20231124081618.png]]
- Photo by [Andras Vas](https://unsplash.com/@wasdrew?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)
# [CLI](https://nookit.dev/bnk-cli/bnk-cli-readme)
Yesterday my friend asked me if BNK had a CLI, which made me realize that a CLI would be quite necessary to help people get started with BNK. The CLI provides preconfigured scripts for setup different deployment environments. Out of the box BNK has a [fly.io](fly.io) setup script. Since BNK is very self contained, it is very easy to deploy to a VM, and currently this is my preference for deploying BNK based apps. The CLI is very young at thing point but it is ready to use to get start with the quick-start project which you can use the CLI to create the fly.io deployment files.

In conclusion, Bun Nook Kit aims to provide a strong base to build projects from or power up your existing app. By adhering to the KISS principle, BNK simplifies the often complex landscape of JavaScript and TypeScript development, offering a suite of independent, well-documented modules and a user-friendly CLI to enhance the developer experience. BNK's modular approach ensures scalability, performance, and ease of integration, all while staying true to the ethos of open-source development. 

If you enjoyed reading please give me a follow and star the repo 
[Bun Nook Kit GitHub Project](https://github.com/nookit-dev/bnkit)

Thank you for reading!
- Brandon Schabel