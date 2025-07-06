# Modpack - Modular and Flexible TypeScript/JavaScript Runtime

## Introduction

**Modpack** is a modular JavaScript runtime that allows you to run JavaScript and TypeScript code in a flexible and isolated environment, built on top of `es-module-shims`. It supports various plugins for module resolution, caching, and code transformation, redefining how modules are processed at runtime.

### Why Modpack?

In today's web development, rigid build tools often limit innovation. Modpack offers a powerful alternative for scenarios demanding **unprecedented control** over module handling. It helps you:

- **Gain Granular Control:** Fine-tune every step of module processing, moving beyond monolithic bundlers.
- **Embrace Extreme Modularity:** Build custom pipelines by adding, removing, or reordering plugins.
- **Power Dynamic Environments:** Perfect for code playgrounds, online editors, and any app needing real-time code manipulation.
- **Leverage Modern Tech:** We stand on the shoulders of giants, orchestrating `es-module-shims` for robust module loading and `SWC-Wasm` for blazing-fast code transformations directly in the browser.

### Installation

Let's walk through a simple example to get Modpack up and running. This demo will show you how to set up Modpack with essential plugins to load, transform, and execute a simple React component from our virtual file system.

```package-install
@modpack/core @modpack/plugins
```

### Import Modpack

```ts
import { Modpack } from "@modpack/core";
import {
  cache,
  external,
  logger,
  resolver,
  virtual,
} from "@modpack/plugins";
import { swc } from "@modpack/plugins";
```

### Create a Modpack Instance

```ts
const modpack = await Modpack.boot({
  debug: false, // Set to true for debugging
  plugins: [
    // **resolver**: Handles how module paths are found, supporting aliases (`@/`) and file extensions.
    resolver({
      extensions: [".js", ".ts", ".tsx", ".jsx"],
      alias: { "@/": "/src/" },
      index: true,
    }),
    // **cache**: Optimizes fetching by storing and serving previously loaded modules.
    cache(),
    // **virtual**: Enables Modpack to read modules directly from its in-memory file system (`modpack.fs`).
    virtual(),
    // **external**: Resolves and fetches modules from external URLs, like CDNs (e.g., from `https://esm.sh/*`).
    external(),
    // **swc**: Transforms your TypeScript and JSX code into standard JavaScript, essential for React.
    swc({
      extensions: [".js", ".ts", ".tsx", ".jsx"],
      jsc: {
        target: "es2022",
        parser: {
          syntax: "typescript",
          tsx: true,
        },
      },
      sourceMaps: true,
      module: {
        type: "es6",
        strict: false,
        ignoreDynamic: true,
        importInterop: "swc",
      },
    }),
    // **logger**: Provides detailed logs of Modpack's operations, very useful for debugging your pipeline.
    logger(),
  ],
});
```

### Minimal React Application

```ts
modpack.fs.writeFile(
  "/main.jsx",
  `import { createRoot } from 'react-dom/client'
  import { useState } from 'react';

  const Application = () => {
    const [count, setCount] = useState(0);
    return (
      <div>
        <h1>Count: {count}</h1>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
      </div>
    )
  }

  createRoot(document.getElementById('modpackRoot')).render(
    <Application />,
  )`
);
```

### Run the Module

Finally, tell Modpack which module to load and execute.

```ts
await modpack.mount("/main.jsx");
```

After calling `modpack.mount()`, Modpack will process `/main.jsx` through its configured pipeline:

1. The virtual plugin's resolver identifies `/main.jsx` in the virtual file system.
2. The virtual plugin's fetcher retrieves the content of `/main.jsx` from `modpack.fs`.
3. The `swc` transformer transpiles the JSX/TypeScript code into standard JavaScript.
4. The JavaScript code is then executed in your environment, rendering the React Application component into the `<div id="modpackRoot"></div>` element you prepared.
5. You should now see the React counter application running in your browser!
