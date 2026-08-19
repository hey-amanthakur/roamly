FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN mkdir -p images

RUN npx tsc --skipLibCheck

EXPOSE 5001

CMD ["node", "dist/index.js"]
