import Spline from '@splinetool/react-spline/next';
import Header from "./_components/Header";
import Hero from "./_components/Hero";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Spline 3D model as background */}
      <div className="absolute inset-0 z-0">
        <Spline 
          scene="https://prod.spline.design/UK3pH-pqYBgKzbLe/scene.splinecode"
          // "https://prod.spline.design/L-9ftzufk-Z9FqHc/scene.splinecode"
          // 
          // "https://prod.spline.design/pS5RzgZp4ZhcVwAr/scene.splinecode"
          // "https://prod.spline.design/PC2xpNZjpZknh5s4/scene.splinecode"
          // "https://prod.spline.design/Wvhsrl3YG7ETCVhw/scene.splinecode"
          // "https://prod.spline.design/iXAEsY5xjb72zmvq/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Content overlay with pointer-events-none to allow clicking through to the background */}
      <div className="absolute inset-0 z-10 md:px-16 lg:px-24 xl:px-36 pointer-events-none">
        {/* ONLY the interactive elements inside Header and Hero should have pointer-events-auto */}
        <div className="pointer-events-none">
          <Header />
        </div>

        <div className="pointer-events-none">
          <Hero />
        </div>
      </div>
    </div>
  );
}