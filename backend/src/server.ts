import { env } from "./config/env";
import { createApp } from "./app";
import { prisma } from "./config/prisma";
import { logger } from "./utils/logger";

const app = createApp();

async function start() {
  await prisma.$connect();
  app.listen(env.PORT, () => {
    logger.info("Backend listening", {
      url: `http://localhost:${env.PORT}`,
      port: env.PORT,
      env: env.NODE_ENV,
    });
  });
}

start().catch(async (error: unknown) => {
  logger.error("Failed to start backend", { error: error instanceof Error ? error : new Error(String(error)) });
  await prisma.$disconnect();
  process.exit(1);
});
