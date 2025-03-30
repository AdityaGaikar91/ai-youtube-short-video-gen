import Spline from '@splinetool/react-spline/next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ComingSoon() {
  return (
    <div className="relative h-screen w-full text-white text-center flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Spline scene="https://prod.spline.design/V2Zk9XCbQA9TQyKh/scene.splinecode" className="w-full h-full" />
      </div>
      <div className="relative z-10 bg-black bg-opacity-50 p-6 rounded-lg">
        <h1 className="text-5xl font-bold mb-4 animate-pulse">Coming Soon</h1>
        <p className="text-lg mb-6">We're working hard to bring something amazing.</p>
        <Link href="/dashboard">
          <Button>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
