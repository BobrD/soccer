FROM node:12.13.1-stretch as builder

COPY . .

RUN yarn

RUN yarn run build

FROM nginx:1.17.6-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /dist /var/www/soccer

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]