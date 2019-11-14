## Usage

Navigating to the root will show the default view, if you want to include more metrics, you can specify in the query parameters (e.g: http://localhost:3000/?metrics=Iavg_A,Q1,P3)

When the fetched points for the graph exceed a certain amount (1500), it will downsample using a LTTB algorithm, but every time you zoom in or out it will fetch data from the server again, and if the range is small enough you will see the actual data points. 

Color sections on the default graph:
yellow -> unloaded
orange -> idle
red -> loaded

## Setup and development

### `npm install` or `yarn`

Installs all dependencies

### `npm yarn seed`

Will seed the database. The project uses mongodb, set the MONGO_URI environment variable via a `.env` file or otherwise prior to running this

### `npm start` or `yarn start`

Runs the project in development mode.  
You can view the application at `http://localhost:3000`

The page will reload if you make edits.

### `npm run build` or `yarn build`

Builds the app for production to the build folder.

The build is minified and the filenames include the hashes.

### `npm run start:prod` or `yarn start:prod`

Runs the compiled app in production.

You can again view the application at `http://localhost:3000`

### `npm test` or `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm start -- --inspect` or `yarn start -- --inspect`

To debug the node server, you can use `razzle start --inspect`. This will start the node server and enable the inspector agent. For more information, see [this](https://nodejs.org/en/docs/inspector/).

### `npm start -- --inspect-brk` or `yarn start -- --inspect-brk`

To debug the node server, you can use `razzle start --inspect-brk`. This will start the node server, enable the inspector agent and Break before user code starts. For more information, see [this](https://nodejs.org/en/docs/inspector/).

### `rs`

If your application is running, and you need to manually restart your server, you do not need to completely kill and rebundle your application. Instead you can just type `rs` and press enter in terminal.