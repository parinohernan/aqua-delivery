# Acceso desde la Red Local

## Configuración

La aplicación ya está configurada para ser accesible desde otros dispositivos en tu red local.

### 1. Iniciar el servidor de desarrollo

```bash
cd reactfront
npm run dev
```

El servidor mostrará algo como:
```
➜ Local:   http://localhost:4321/
➜ Network: http://192.168.1.110:4321/
```

### 2. Acceder desde otro dispositivo

En otro dispositivo conectado a la misma red WiFi:

1. Abre un navegador web
2. Ingresa la URL que aparece en "Network" (ejemplo: `http://192.168.1.110:4321`)
3. La aplicación debería cargar correctamente

### 3. Configuración del Backend

El backend debe estar corriendo y accesible desde la red local:

- El backend ya está configurado para escuchar en todas las interfaces (`0.0.0.0`)
- El CORS del backend permite conexiones desde IPs locales (192.168.x.x)
- El backend debe estar corriendo en el puerto 8001

### 4. Si tienes problemas de conexión

Si el frontend no puede conectarse al backend desde otro dispositivo:

1. Verifica que el backend esté corriendo:
   ```bash
   # En el directorio backend
   npm start
   ```

2. Verifica que el firewall no esté bloqueando los puertos:
   - Puerto 4321 (frontend)
   - Puerto 8001 (backend)

3. Crea un archivo `.env` en `reactfront/` con:
   ```
   VITE_API_BASE_URL=http://192.168.1.110:8001
   ```
   (Reemplaza `192.168.1.110` con la IP de tu servidor)

4. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Notas

- La IP puede cambiar si tu router asigna IPs dinámicas
- Asegúrate de que ambos dispositivos estén en la misma red WiFi
- Algunos routers pueden tener "Aislamiento de AP" activado, lo que impide la comunicación entre dispositivos

