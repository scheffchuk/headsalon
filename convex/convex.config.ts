import { defineApp } from "convex/server";
import rag from "@convex-dev/rag/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();
app.use(rag);
app.use(aggregate, { name: "articleAggregate" });

export default app;