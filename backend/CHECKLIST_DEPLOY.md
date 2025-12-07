# ✅ Checklist Pre-Deploy Koyeb

## Antes de Deployar

### 1. Configuración de Google Cloud MySQL
- [ ] MySQL configurado para aceptar conexiones remotas (`bind-address = 0.0.0.0`)
- [ ] Usuario remoto creado (`koyeb_user@'%'`)
- [ ] Firewall de Google Cloud permite puerto 3306
- [ ] IP externa de la VM anotada: `___________________`

### 2. Repositorio Git
- [ ] Git inicializado en el proyecto
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub
- [ ] URL del repo: `___________________`

### 3. Variables de Entorno Preparadas
- [ ] `DB_HOST`: IP externa de tu VM de Google Cloud
- [ ] `DB_USER`: koyeb_user (o el que hayas creado)
- [ ] `DB_PASSWORD`: Password seguro
- [ ] `DB_NAME`: deliverydeagua
- [ ] `DB_PORT`: 3306
- [ ] `JWT_SECRET`: Token secreto seguro
- [ ] `FRONTEND_URL`: https://aquadeliverymanager.netlify.app

### 4. Cuenta Koyeb
- [ ] Cuenta creada en https://www.koyeb.com
- [ ] GitHub conectado a Koyeb

## Durante el Deploy

### 5. Configuración en Koyeb
- [ ] Repositorio seleccionado
- [ ] Builder: Buildpack
- [ ] Run command: `npm start`
- [ ] Instance type: Nano (gratis)
- [ ] Port: 8001
- [ ] Health check path: `/health`
- [ ] Todas las variables de entorno configuradas
- [ ] Variables sensibles marcadas como "Secret"

### 6. Deployment
- [ ] Click en "Deploy"
- [ ] Esperar 2-5 minutos
- [ ] Verificar logs (sin errores)

## Después del Deploy

### 7. Verificación
- [ ] Health check funciona: `curl https://tu-app.koyeb.app/health`
- [ ] Endpoint de API funciona: `curl https://tu-app.koyeb.app/api/productos`
- [ ] URL de Koyeb anotada: `___________________`

### 8. Actualizar Frontend
- [ ] Actualizar `.env` del frontend con nueva URL
- [ ] Actualizar `api.js` del frontend
- [ ] Re-deployar frontend en Netlify

### 9. Testing Final
- [ ] Login funciona desde el frontend
- [ ] Crear/editar/eliminar clientes funciona
- [ ] Crear/editar/eliminar productos funciona
- [ ] Crear/editar/eliminar pedidos funciona
- [ ] Todas las funcionalidades principales funcionan

## Troubleshooting

Si algo falla:
1. ✅ Revisar logs en Koyeb dashboard
2. ✅ Verificar variables de entorno
3. ✅ Verificar conexión a MySQL desde Koyeb
4. ✅ Verificar CORS en el navegador (F12 > Console)
5. ✅ Consultar `DEPLOY_KOYEB.md` para más detalles

---

**Fecha de deploy:** ___________________
**Deployed by:** ___________________
**Notas:** ___________________
