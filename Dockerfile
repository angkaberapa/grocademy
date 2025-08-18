FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

COPY src/views ./src/views

# Create uploads directory structure
RUN mkdir -p uploads/courses/thumbnails uploads/modules/pdfs uploads/modules/videos

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
