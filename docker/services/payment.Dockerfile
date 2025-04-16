FROM node:18-buster

WORKDIR /app

COPY package.json package-lock.json ./

RUN apt-get update && apt-get install -y openssl && npm install

COPY . .

EXPOSE 6003

# Generate Prisma Client
RUN npx prisma generate

# (Opsional: hanya jika kamu mau apply migration juga)
# RUN npx prisma migrate deploy

RUN npm run build

CMD ["npm", "start"]
