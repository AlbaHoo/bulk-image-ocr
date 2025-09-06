# Parse OCR Application

A React TypeScript application for image management and OCR (Optical Character Recognition) text extraction. This application allows users to organize images in grid layouts and automatically extract text using OCR technology.

## Project Structure
```
├── public
│   ├── index.html                   // Main HTML file
│   └── vite.svg                     // Vite logo
├── src
│   ├── assets                       // Image assets
│   ├── components                   // Shared components
│   │   ├── Common                   // Commonly used components
│   │   ├── Layout                    // Layout components
│   │   └── OCR                      // OCR related components
│   ├── hooks                        // Custom React hooks
│   ├── pages                        // Application pages
│   │   ├── Home                     // Home page
│   │   ├── Login                    // Login page
│   │   ├── NotFound                 // 404 Not Found page
│   │   └── Register                 // Register page
│   ├── services                     // API service requests
│   │   ├── api.ts                   // API service
│   │   └── index.ts                 // Integration service
│   ├── store                        // Global state management
│   │   ├── slices                   // Redux slices
│   │   └── store.ts                 // Redux store configuration
│   ├── styles                       // Global styles
│   │   ├── index.css                // Main CSS file
│   │   └── variables.css            // CSS variables
│   ├── utils                        // Utility functions
│   └── App.tsx                      // Main App component
└── tsconfig.json                   // TypeScript configuration
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

```
VITE_API_URL=your_api_url
VITE_OSS_BUCKET=your_oss_bucket
VITE_OSS_REGION=your_oss_region
```

## Deployment

For deployment, the application is built using Vite and deployed to an OSS (Object Storage Service) bucket. The deployment script is configured in the `package.json` file.

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs the project dependencies.

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run preview`

Starts a local preview server for the production build.

### `npm run deploy`

Deploys the application to the configured OSS bucket.

### `npm run lint`

Runs the linter to check for code style and quality issues.

### `npm run format`

Formats the code using Prettier.

## Learn More

You can learn more in the [Vite documentation](https://vitejs.dev/guide/).

To learn React, check out the [React documentation](https://reactjs.org/).
