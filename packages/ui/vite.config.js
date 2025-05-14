import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dotenv from 'dotenv'

export default defineConfig(async ({ mode }) => {
    let proxy = undefined
    if (mode === 'development') {
        const serverEnv = dotenv.config({ processEnv: {}, path: '../server/.env' }).parsed
        const serverHost = serverEnv?.['HOST'] ?? 'localhost'
        const serverPort = parseInt(serverEnv?.['PORT'] ?? 3000)
        if (!Number.isNaN(serverPort) && serverPort > 0 && serverPort < 65535) {
            proxy = {
                '^/api(/|$).*': {
                    target: `http://${serverHost}:${serverPort}`,
                    changeOrigin: true
                }
            }
        }
    }

    dotenv.config()
    const env = process.env
    
    // Define default environment variables
    const envDefaults = {
        VITE_ALLOWED_IFRAME_ORIGINS: env.VITE_ALLOWED_IFRAME_ORIGINS || ''
    }
    
    // Parse allowed origins
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://polarops.x2bee.com',
        ...(env.VITE_ALLOWED_IFRAME_ORIGINS || '').split(',').filter(Boolean)
    ]

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@codemirror/state': resolve(__dirname, '../../node_modules/@codemirror/state'),
                '@codemirror/view': resolve(__dirname, '../../node_modules/@codemirror/view'),
                '@codemirror/language': resolve(__dirname, '../../node_modules/@codemirror/language'),
                '@codemirror/lang-javascript': resolve(__dirname, '../../node_modules/@codemirror/lang-javascript'),
                '@codemirror/lang-json': resolve(__dirname, '../../node_modules/@codemirror/lang-json'),
                '@uiw/react-codemirror': resolve(__dirname, '../../node_modules/@uiw/react-codemirror'),
                '@uiw/codemirror-theme-vscode': resolve(__dirname, '../../node_modules/@uiw/codemirror-theme-vscode'),
                '@uiw/codemirror-theme-sublime': resolve(__dirname, '../../node_modules/@uiw/codemirror-theme-sublime'),
                '@lezer/common': resolve(__dirname, '../../node_modules/@lezer/common'),
                '@lezer/highlight': resolve(__dirname, '../../node_modules/@lezer/highlight')
            }
        },
        root: resolve(__dirname),
        build: {
            outDir: './build'
        },
        server: {
            open: true,
            proxy,
            port: process.env.VITE_PORT ?? 8080,
            host: process.env.VITE_HOST,
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': allowedOrigins.join(', '),
                'Access-Control-Allow-Methods': 'GET',
                'X-Frame-Options': 'ALLOW-FROM ' + allowedOrigins.join(' ')
            },
            middlewares: [
                (req, res, next) => {
                    // Add frame-ancestors to Content-Security-Policy header
                    res.setHeader(
                        'Content-Security-Policy',
                        `frame-ancestors 'self' ${allowedOrigins.join(' ')};`
                    )
                    next()
                }
            ]
        },
        define: {
            'import.meta.env.VITE_ALLOWED_IFRAME_ORIGINS': JSON.stringify(envDefaults.VITE_ALLOWED_IFRAME_ORIGINS)
        }
    }
})
