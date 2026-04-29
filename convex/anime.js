import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export const FetchAiringAnime = action({
    args: { page: v.number(), perPage: v.number() },
    handler: async (ctx, args) => {
        const cacheKey = `airing_anime_${args.page}_${args.perPage}`;
        
        // Check cache first
        const cached = await ctx.runQuery(api.anime.GetCachedData, { key: cacheKey });
        if (cached && (Date.now() - cached.updatedAt < CACHE_TTL)) {
            return cached.data;
        }

        const queryStr = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
                        id
                        title {
                            romaji
                            english
                        }
                        episodes
                        nextAiringEpisode {
                            airingAt
                            episode
                        }
                        coverImage {
                            large
                        }
                        description
                        genres
                        bannerImage
                    }
                }
            }
        `;

        const response = await fetch(ANILIST_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: queryStr,
                variables: { page: args.page, perPage: args.perPage }
            })
        });

        const result = await response.json();
        
        if (result.data) {
            // Update cache
            await ctx.runMutation(api.anime.UpdateCache, {
                key: cacheKey,
                data: result.data.Page
            });
            return result.data.Page;
        }

        return null;
    }
});

export const SearchAnime = action({
    args: { search: v.string() },
    handler: async (ctx, args) => {
        const queryStr = `
            query ($search: String) {
                Page(page: 1, perPage: 12) {
                    media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
                        id
                        title {
                            romaji
                            english
                        }
                        coverImage {
                            large
                        }
                        description
                        episodes
                    }
                }
            }
        `;

        const response = await fetch(ANILIST_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: queryStr,
                variables: { search: args.search }
            })
        });

        const result = await response.json();
        return result.data?.Page?.media || [];
    }
});

export const GetCachedData = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('animeCache')
            .withIndex('by_key', q => q.eq('key', args.key))
            .first();
    }
});

export const UpdateCache = mutation({
    args: { key: v.string(), data: v.any() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('animeCache')
            .withIndex('by_key', q => q.eq('key', args.key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                data: args.data,
                updatedAt: Date.now()
            });
        } else {
            await ctx.db.insert('animeCache', {
                key: args.key,
                data: args.data,
                updatedAt: Date.now()
            });
        }
    }
});
