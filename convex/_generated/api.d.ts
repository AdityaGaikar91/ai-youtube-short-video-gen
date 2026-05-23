/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as anime from "../anime.js";
import type * as recurringSchedules from "../recurringSchedules.js";
import type * as scheduledPosts from "../scheduledPosts.js";
import type * as socialAccounts from "../socialAccounts.js";
import type * as users from "../users.js";
import type * as videoData from "../videoData.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  anime: typeof anime;
  recurringSchedules: typeof recurringSchedules;
  scheduledPosts: typeof scheduledPosts;
  socialAccounts: typeof socialAccounts;
  users: typeof users;
  videoData: typeof videoData;
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

export declare const components: {};
