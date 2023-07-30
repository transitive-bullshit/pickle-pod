/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com', 'yt3.ggpht.com']
  },
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
      skipDefaultConversion: true,
      preventFullImport: true
    }
  }
}

export default nextConfig
