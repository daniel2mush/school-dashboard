/** @type {import('next').NextConfig} */
const nextConfig = {
    onDemandEntries: {
        maxInactiveAge: 15 * 1000,
        pagesBufferLength: 2,
    },

    // Add this Webpack override:
    webpack: (config, { dev }) => {
        if (dev) {
            // Completely disable webpack caching in development
            config.cache = false;
        }
        return config;
    },
};

export default nextConfig;