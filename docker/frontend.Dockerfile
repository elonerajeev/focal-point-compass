FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine AS runner
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/frontend.nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R app:app /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    sed -i 's/^user nginx;/user app;/' /etc/nginx/nginx.conf
USER app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
