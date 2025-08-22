FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy views to the correct location for production
RUN cp -r src/views dist/src/

# Create uploads directory structure with proper permissions
RUN mkdir -p uploads/courses/thumbnails uploads/modules/pdfs uploads/modules/videos uploads/certificates && \
    chmod -R 755 uploads

# Expose port (Render uses PORT env variable)
EXPOSE $PORT

# Start the application in production mode
CMD ["npm", "run", "start:prod"]
