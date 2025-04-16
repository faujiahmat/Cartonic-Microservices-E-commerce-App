FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install


COPY . .

EXPOSE 6002

RUN npm run build

CMD ["npm", "start"]
