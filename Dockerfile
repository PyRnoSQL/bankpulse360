FROM node:20.11-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
ARG CACHEBUST=20260521120633
COPY . .
RUN node node_modules/vite/bin/vite.js build
EXPOSE 3000
CMD ["node", "server/index.js"]
