import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Background3D from './_components/Background3D';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Spline 3D model as background */}
      {/* Spline 3D model as background */}
      <Background3D />
      
      {/* Content overlay with pointer-events-none to allow clicking through to the background */}

      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Full width Header */}
        <div>
          <Header />
        </div>

        {/* Constrained Hero section */}
        <div className="md:px-16 lg:px-24 xl:px-36">
          <Hero />
        </div>
      </div>
    </div>
  );
}