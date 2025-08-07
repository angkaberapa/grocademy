FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

COPY src/views ./src/views

EXPOSE 3000

CMD ["node", "dist/main.js"]
