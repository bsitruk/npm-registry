import { createApp } from "./app";
import getPort from "get-port";

const DEFAULT_PORT = 3001;

async function main() {
  // Initialise the server framework and routing
  const server = createApp();

  // Attempt to get the default port, otherwise choose for us
  const port = await getPort({ port: DEFAULT_PORT });

  server.listen(port, "0.0.0.0");

  console.info(`Server listening at http://0.0.0.0:${port}`);
}

main();
