/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
ignoreDuringBuilds: true,

},
typescript: {
  ignoreBuildErrors: true,
},
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  webpack: (config, { isServer }) => {
    // Fix for Firebase and undici compatibility issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        buffer: false,
        util: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        path: false,
        zlib: false,
      };
    }
    
    // Exclude undici from webpack processing
    config.externals = config.externals || [];
    config.externals.push({
      'undici': 'undici',
    });
    
    // Add module rules to ignore undici private syntax
    config.module.rules.push({
      test: /node_modules\/undici\/.*\.js$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
