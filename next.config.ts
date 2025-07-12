import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";
import "dotenv/config";

const nextConfig: NextConfig = withAxiom({
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack'],
		});
		return config;
	},
	env: {
		DEV_ENDPOINT: process.env.DEV_ENDPOINT,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'wsrv.nl',
				pathname: '/**',
			},
		],
	},
});

export default nextConfig;
