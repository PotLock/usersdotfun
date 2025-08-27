import { RPCHandler } from "@orpc/server/fetch"
import { Hono } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from './lib/auth'
import { createContext } from './lib/context'
import { appRouter } from './routers'
// import websocketRoutes, { websocket } from './routes/websocket'

const app = new Hono();

app.use('*', logger())
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || "*",
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
}));

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// app.use('*', authMiddleware);
app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 100,
  keyGenerator: (c: any) => {
    const user = c.var.user;
    return user?.id || c.req.header('x-forwarded-for') || 'anonymous'
  }
}));

const handler = new RPCHandler(appRouter);
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c });
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});

// app.route('/api/ws', websocketRoutes);

const port = parseInt(process.env.PORT || '3001')
console.log(`Gateway running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
  // websocket,
}
