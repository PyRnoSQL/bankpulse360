FROM node:20.11-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG CACHEBUST=20260521131546
RUN rm -rf dist && node node_modules/vite/bin/vite.js build
EXPOSE 3000
CMD ["node", "server/index.js"]
