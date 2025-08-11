FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

COPY src/views ./src/views

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
