FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL=https://ticketing-backend-1007199598260.europe-west4.run.app
ENV VITE_API_URL=${VITE_API_URL}
COPY package*.json ./
RUN npm install
COPY . .
RUN npm rebuild
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 8080
ENV PORT=8080
CMD ["serve", "-s", "dist", "-l", "8080"]
