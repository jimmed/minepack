# About _The Monorepo™_

This repository holds the source code for a number of different npm modules.

## When first checking out the repository

```sh
$ yarn
$ yarn build
```

This will ensure that TypeScript definitions are available for any cross-package dependencies

## Creating a new package

If you want to create a new package, the bare minimum setup is:

1. Create a directory

   ```sh
   $ mkdir packages/my-new-package
   $ cd packages/my-new-package
   ```

2. Initialise the `package.json` file

   ```sh
   $ yarn init --name @minepack/my-new-package
   ```

3. Create a `tsconfig.json` file:

   ```json
   {
     "extends": "../tsconfig.settings.json",
     "compilerOptions": {
       "outDir": "./lib",
       "rootDir": "./src"
     }
   }
   ```

## Adding a cross-package dependency

If you want to use `package-b` in `package-a`, you must:

1. Add the dependency using yarn:

   ```sh
   $ cd packages/package-a
   $ yarn add @minepack/package-b
   ```

2. Add the project reference to the `tsconfig.json` in your package:

   ```json
   {
     // ...rest as normal
     "references": [{ "path": "../package-b" }]
   }
   ```
