FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm install

COPY . .
RUN npm rebuild
RUN npm run prisma:generate
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]
