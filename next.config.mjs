/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains: ['lh3.googleusercontent.com','firebasestorage.googleapis.com']
    },
    transpilePackages: ['@splinetool/react-spline']
};

export default nextConfig;
