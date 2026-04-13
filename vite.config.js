import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import http from 'http'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(), 
        basicSsl(),
        {
            name: 'http-redirect',
            configureServer(server) {
                const redirectServer = http.createServer((req, res) => {
                    const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost'
                    res.writeHead(301, { Location: `https://${host}:5173${req.url}` })
                    res.end()
                })
                redirectServer.listen(8080, () => {
                    console.log('➜  Redirect:  http://<your-ip>:8080 auto-redirects to HTTPS')
                }).on('error', () => { /* gracefully ignore if port taken */ })
            }
        }
    ],
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5001',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
