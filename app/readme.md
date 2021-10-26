# Example web app

An example SSR web app using:

- [`next`](https://npm.im/next)
- [`apollo-upload-client`](https://npm.im/apollo-upload-client)

## Setup

1.  Install the latest [Node.js](https://nodejs.org) and [npm](https://npmjs.com).
2.  Duplicate `.env.example` as `.env` and configure.
3.  Run `npm install --legacy-peer-deps` in the `app` directory with Terminal.
4.  Run `npm run dev` for development, or `npm run build && npm start` for production.

## App
App is listening on http://localhost:3000/  
GraphQL is listening on http://localhost:3001/graphql   

Ensure your editor supports:

- [EditorConfig](http://editorconfig.org).
- [ESLint](http://eslint.org), respecting `package.json` config.
  - [Atom](https://atom.io): [`linter-eslint`](https://atom.io/packages/linter-eslint).
  - [VS Code](https://code.visualstudio.com): [`vscode-eslint`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

## Support

See `package.json` `engines` and `browserslist`.

## Node 17 error
[webpack-cli] Error: error:0308010C:digital envelope routines::unsupported

`export NODE_OPTIONS=--openssl-legacy-provider`
