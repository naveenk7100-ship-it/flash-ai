# ==========================================
# FLASH.Ai Node.js Production Backend Image
# ==========================================
FROM node:22-bookworm-slim

# Install system dependencies (ffmpeg, fonts, curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-freefont-ttf \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm install

# Copy application source
COPY . .

# Build frontend and compile TypeScript
RUN npm run build

# Default environment
ENV NODE_ENV=production
ENV PORT=3000

# Mount points for persistent data and rendered media
VOLUME ["/app/data", "/app/media"]

# Expose API and static server port
EXPOSE 3000

# Container healthcheck using dedicated health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the unified production server (serves API, background scheduler & static UI)
CMD ["npm", "start"]
