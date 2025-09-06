# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Project UI Process Structure

```
├── src
│   ├── App.tsx                       // App layout, registAgentStatusChangeHandler
│   ├── Context.tsx                   // GlobalContext, track agent status
│   ├── index.tsx                     // App Routes
│   ├── routes
│   │   ├── bridge                    // Navigate to setup / console page
│   │   ├── console                   // Agent sync record tab, log tab
│   │   ├── integrate                 // Init PMS data sync (no used)
│   │   └── setup                     // Setup integration login / select pms / checking pms
│   ├── services
│   │   ├── api.ts                    // Cotreat Api Service request
│   │   └── index.ts                  // Cotreat Integration Service request
│   ├── shared                        // Shared code with main process
│   │   ├── api
│   │   │   ├── generated             // openapitools auto generated code
│   │   │   │   ├── api.ts
│   │   │   │   ├── base.ts
│   │   │   │   ├── common.ts         // Rewrited do not commit auto generatored code
│   │   │   │   ├── configuration.ts  // Rewrited do not commit auto generatored code
│   │   │   │   ├── git_push.sh
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── config
│   │   ├── typings
│   │   └── utils
└── typings.d.ts                      // main and render process communication declare type
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:8061](http://localhost:8061) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

If you want build in local please replace `.env.production` to real value like `.env`. In github action we will set env variables located in [github/envs](../.github/envs/) before build. See the section about [Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables) for more information.

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `npm run api-gen`

[OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator-cli), you need start the [cotreat-integration-service](https://github.com/CoTreat/cotreat-integration-service) first.

Can update [generator-cli version](https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/) in openapitools.json.

**_Manually rewrite the `api/generated/common.ts/createRequestFunction` and `api/generated/configuration.ts` for handle axios error message, so do not commit auto generatored code._**

## Configuration

### Path Alias
- [How to Use Path Aliases With Create React App](https://devtails.xyz/how-to-use-path-aliases-with-create-react-app-webpack-and-typescript)
- [Absolute imports with Create React App](https://medium.com/hackernoon/absolute-imports-with-create-react-app-4c6cfb66c35d)

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


 aliyun oss cp build oss://app-media-trust--recursive
