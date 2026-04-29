import React from 'react'
import { Button } from '@/components/ui/button'
import { Info, Sparkles } from 'lucide-react'
import AnimeWrapper from '@/app/_components/AnimeWrapper'
import { useRouter } from 'next/navigation'

export default function AnimeCard({ anime }) {
    const router = useRouter();

    const handleCreateVideo = () => {
        const title = anime.title.english || anime.title.romaji;
        const episode = anime.nextAiringEpisode?.episode || anime.episodes || 'Latest';
        const topic = `${title} Episode ${episode}`;
        router.push(`/create-new-video?topic=${encodeURIComponent(topic)}`);
    }

    return (
        <AnimeWrapper animation="slideUp" delay={100}>
            <div className="group relative flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 shadow-xl h-full">
                {/* Image Section */}
                <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                        src={anime.coverImage.large} 
                        alt={anime.title.romaji}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                    
                    {/* Badge */}
                    {anime.nextAiringEpisode && (
                        <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-white/20">
                            EP {anime.nextAiringEpisode.episode} AIRING
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {anime.title.english || anime.title.romaji}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                        {anime.genres?.slice(0, 2).map(genre => (
                            <span key={genre} className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                                {genre}
                            </span>
                        ))}
                    </div>

                    <p className="text-white/40 text-[11px] line-clamp-2 mb-4 leading-snug flex-1" 
                       dangerouslySetInnerHTML={{ __html: anime.description }} 
                    />

                    <div className="flex gap-2 mt-auto">
                        <Button 
                            className="flex-1 h-9 bg-primary/80 hover:bg-primary text-white border-none shadow-lg group/btn font-semibold"
                            onClick={handleCreateVideo}
                        >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 group-hover/btn:animate-pulse" />
                            Create
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon"
                            className="h-9 w-9 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                            onClick={() => window.open(`https://anilist.co/anime/${anime.id}`, '_blank')}
                        >
                            <Info className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </AnimeWrapper>
    )
}
