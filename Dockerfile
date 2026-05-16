FROM node:20.11-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN node node_modules/vite/bin/vite.js build
EXPOSE 3000
CMD ["node", "server/index.js"]
