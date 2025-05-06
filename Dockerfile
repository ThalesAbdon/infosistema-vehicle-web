FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --prod

FROM node:18

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist/vehicle-app/browser/ /usr/share/nginx/html/

EXPOSE 5000

CMD ["serve", "-s", "/usr/share/nginx/html", "-l", "5000"]
