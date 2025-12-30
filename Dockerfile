FROM node:24.12.0

# Create app directory
WORKDIR /app

# Copy package files for Docker layer caching
COPY --chown=node:node package*.json ./

# Install all dependencies
RUN npm ci

# Copy the rest of the auth API source code
COPY --chown=node:node . .

# Run as non-root
USER node

# Document the port (actual binding happens via docker-compose)
EXPOSE 3000

# Start the auth API service
RUN echo "Executing start command..."
CMD ["npm", "start"]