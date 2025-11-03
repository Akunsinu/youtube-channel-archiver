FROM node:18-alpine

# Install Python and dependencies for yt-dlp
RUN apk add --no-cache python3 py3-pip ffmpeg

# Install yt-dlp
RUN pip3 install --no-cache-dir yt-dlp

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Create data directory for videos
RUN mkdir -p /data/videos

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
