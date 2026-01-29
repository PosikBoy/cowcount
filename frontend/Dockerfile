FROM node:20-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# install deps
COPY package.json package-lock.json ./
RUN npm ci

# copy source
COPY . .

# build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
