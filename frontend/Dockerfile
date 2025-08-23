# Dockerfile para Frontend - Astro
FROM node:18-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine AS production

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001

# Exponer el puerto 80
EXPOSE 80

# Comando de salud para verificar que Nginx esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
