# Stage 1: Build React App
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the app using a lightweight web server
FROM node:22-alpine

WORKDIR /app

# Install serve (lightweight static file server)
RUN npm install -g serve

# Copy build output from builder
COPY --from=builder /app/dist ./dist

# Expose port dynamically (default 5173)
ARG PORT=5173
ENV PORT=$PORT

EXPOSE ${PORT}

# Start the app
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
