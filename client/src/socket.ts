import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const SERVER_URL =
  import.meta.env.VITE_SERVER_PRODUCTION_URL ??
  import.meta.env.VITE_SERVER_DEVELOPMENT_URL;

export const socket = io(SERVER_URL);
