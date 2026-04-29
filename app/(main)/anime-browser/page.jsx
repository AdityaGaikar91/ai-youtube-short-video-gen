"use client"
import React, { useState, useEffect } from 'react'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import AnimeCard from './_components/AnimeCard'
import { Search, Loader2, Tv, Sparkles, TrendingUp } from 'lucide-react'
import AnimeWrapper from '@/app/_components/AnimeWrapper'

export default function AnimeBrowserPage() {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [animeList, setAnimeList] = useState([]);
    const [searchMode, setSearchMode] = useState(false);

    const fetchAiring = useAction(api.anime.FetchAiringAnime);
    const searchAnime = useAction(api.anime.SearchAnime);

    useEffect(() => {
        loadAiring();
    }, []);

    const loadAiring = async () => {
        setLoading(true);
        setSearchMode(false);
        try {
            const data = await fetchAiring({ page: 1, perPage: 12 });
            if (data) setAnimeList(data.media);
        } catch (error) {
            console.error("Error fetching airing anime:", error);
        }
        setLoading(false);
    }

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            if (!search.trim()) {
                loadAiring();
                return;
            }
            
            setLoading(true);
            setSearchMode(true);
            try {
                const results = await searchAnime({ search: search.trim() });
                setAnimeList(results);
            } catch (error) {
                console.error("Error searching anime:", error);
            }
            setLoading(false);
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
            {/* Header Section */}
            <AnimeWrapper animation="slideUp">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30">
                                <Tv className="w-10 h-10 text-primary" />
                            </div>
                            Anime Browser
                        </h1>
                        <p className="text-white/50 mt-4 text-lg leading-relaxed">
                            Discover currently airing series and upcoming releases. Generate viral short videos about your favorite shows in seconds.
                        </p>
                    </div>

                    <div className="relative w-full lg:w-96 group">
                        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search anime (e.g. Solo Leveling)"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-md transition-all placeholder:text-white/20 relative z-10 shadow-2xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-bold border border-white/10 px-1.5 py-0.5 rounded pointer-events-none">
                            ENTER
                        </div>
                    </div>
                </div>
            </AnimeWrapper>

            {/* Content Section Header */}
            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    {searchMode ? (
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                        </div>
                    ) : (
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                    )}
                    {searchMode ? `Search Results for "${search}"` : 'Airing This Week'}
                </h2>
                {searchMode && (
                    <button 
                        onClick={loadAiring}
                        className="text-primary hover:text-primary/80 transition-colors text-sm font-bold flex items-center gap-1"
                    >
                        ← Back to Airing
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
                    </div>
                    <div className="text-center">
                        <p className="text-white/60 font-bold text-lg">Accessing AniList Core...</p>
                        <p className="text-white/30 text-sm mt-1">Retrieving high-quality metadata for you</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {animeList.map((anime, index) => (
                        <AnimeCard key={anime.id} anime={anime} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && animeList.length === 0 && (
                <div className="text-center py-40 bg-white/5 rounded-3xl border border-dashed border-white/10 backdrop-blur-sm">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">No results found</h3>
                    <p className="text-white/40 max-w-xs mx-auto mb-8">We couldn't find any anime matching your criteria. Try different keywords.</p>
                    <button 
                        onClick={loadAiring} 
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10"
                    >
                        Reset Browser
                    </button>
                </div>
            )}
        </div>
    )
}
