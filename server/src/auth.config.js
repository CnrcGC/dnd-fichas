import { loadConfig } from "./config.js";
import { createPool } from "./database.js";
import { createAuth } from "./auth.js";

const config = loadConfig();
const pool = createPool(config);

export const auth = createAuth(config, pool);
export default auth;

