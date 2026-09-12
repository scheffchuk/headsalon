import { TableAggregate } from "@convex-dev/aggregate";
import { Triggers } from "convex-helpers/server/triggers";
import { components } from "../_generated/api";
import type { DataModel, Id } from "../_generated/dataModel";

export const articleAggregate = new TableAggregate<{
  Key: [string, Id<"articles">];
  DataModel: DataModel;
  TableName: "articles";
}>(components.articleAggregate, {
  sortKey: (doc) => [doc.date, doc._id],
});

export const articleTriggers = new Triggers<DataModel>();
articleTriggers.register("articles", articleAggregate.idempotentTrigger());
