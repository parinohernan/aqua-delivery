# 🐳 Deploy del Frontend React en Docker

## Solución Implementada

1. **Dockerfile optimizado**: Multi-stage build con Nginx
2. **Configuración Nginx**: Optimizada para SPA
3. **Dependencias limpias**: Leaflet removido (no se usa actualmente)

## Construir y Ejecutar

### Opción 1: Docker Compose (Recomendado)

Agrega al `docker-compose.yml`:

```yaml
  reactfront:
    build:
      context: ./reactfront
      dockerfile: Dockerfile
    container_name: node_aqua_front
    restart: unless-stopped
    ports:
      - "4321:80"
    depends_on:
      - backend
    networks:
      - delivery_network
    environment:
      - NODE_ENV=production
```

Luego ejecuta:
```bash
docker-compose up -d reactfront
```

### Opción 2: Docker Directo

```bash
cd reactfront

# Construir la imagen
docker build -t aqua-frontend .

# Ejecutar el contenedor
docker run -d \
  --name node_aqua_front \
  -p 4321:80 \
  --restart unless-stopped \
  aqua-frontend
```

## Verificar

```bash
# Ver logs
docker logs -f node_aqua_front

# Verificar que esté corriendo
docker ps | grep node_aqua_front

# Probar en el navegador
curl http://localhost:4321
```

## Notas

- El contenedor usa Nginx para servir los archivos estáticos
- La configuración de Nginx está optimizada para SPA (routing con React Router)
- Los assets estáticos tienen cache de 1 año
- `index.html` no se cachea para permitir actualizaciones

## Troubleshooting

### Si sigue fallando la instalación:

1. Limpiar cache de npm en el contenedor:
```bash
docker exec -it node_aqua_front sh
npm cache clean --force
```

2. Reconstruir sin cache:
```bash
docker build --no-cache -t aqua-frontend .
```

### Si la app no carga:

1. Verificar que el build se completó:
```bash
docker logs node_aqua_front
```

2. Verificar que Nginx esté sirviendo archivos:
```bash
docker exec -it node_aqua_front ls -la /usr/share/nginx/html
```

