/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as articleRag from "../articleRag.js";
import type * as articles from "../articles.js";
import type * as http from "../http.js";
import type * as import_articles from "../import_articles.js";
import type * as lib_articleAggregate from "../lib/articleAggregate.js";
import type * as lib_functions from "../lib/functions.js";
import type * as migrations from "../migrations.js";
import type * as rag_search from "../rag_search.js";
import type * as searchResult from "../searchResult.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  articleRag: typeof articleRag;
  articles: typeof articles;
  http: typeof http;
  import_articles: typeof import_articles;
  "lib/articleAggregate": typeof lib_articleAggregate;
  "lib/functions": typeof lib_functions;
  migrations: typeof migrations;
  rag_search: typeof rag_search;
  searchResult: typeof searchResult;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
  articleAggregate: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"articleAggregate">;
};
