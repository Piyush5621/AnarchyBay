# Ngrok Setup for Vite HMR

This guide helps you set up ngrok with Vite Hot Module Replacement (HMR) to avoid WebSocket connection issues.

## Quick Setup

1. **Install ngrok** (if not already installed):
   ```bash
   # Download from https://ngrok.com/download
   # Or using npm: npm install -g ngrok
   ```

2. **Start ngrok** on port 5173 (Vite's default port):
   ```bash
   ngrok http 5173
   ```

3. **Copy the ngrok URL** from the terminal (e.g., `https://abc123.ngrok-free.app`)

4. **Set the environment variable** in your `.env` file:
   ```
   VITE_NGROK_HOST=abc123.ngrok-free.app
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Automated Setup

Use the automated script (requires ngrok to be running):

```bash
npm run dev:ngrok
```

This will automatically detect your ngrok URL and configure the environment.

## Troubleshooting

- **WebSocket connection failed**: Make sure `VITE_NGROK_HOST` is set correctly in `.env`
- **CORS errors**: The Vite config now allows all ngrok hosts automatically
- **HMR not working**: Ensure ngrok is running on port 5173 and the URL is correct

## How it works

- Vite's HMR uses WebSockets for live reloading
- ngrok tunnels HTTPS traffic, so WebSockets need to use WSS (secure WebSocket)
- The config automatically detects ngrok URLs and configures HMR accordingly
- Environment variables make it easy to switch between different ngrok sessions