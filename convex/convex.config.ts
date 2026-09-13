import { defineApp } from "convex/server";
import rag from "@convex-dev/rag/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
app.use(rag);
app.use(aggregate, { name: "articleAggregate" });
app.use(rateLimiter);

export default app;
