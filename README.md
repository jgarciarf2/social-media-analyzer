# 🤖 Social Media Analyzer

Una aplicación web moderna que utiliza **Gemini AI** para analizar sentimientos en comentarios de redes sociales y generar estadísticas detalladas.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-green)

## ✨ Características

- 📱 **Análisis Multi-Plataforma**: Soporta Instagram, Facebook y otras redes sociales
- 🧠 **IA Avanzada**: Utiliza Gemini AI para análisis de sentimientos precisos
- 📊 **Dashboard Visual**: Gráficos interactivos con estadísticas detalladas
- ⚡ **Tiempo Real**: Análisis rápido y eficiente
- 🎨 **Interfaz Moderna**: Diseño responsivo con Tailwind CSS
- 🔒 **Seguro**: API keys protegidas en el backend

## 🚀 Demo

La aplicación analiza automáticamente comentarios y proporciona:

- **Estadísticas de Sentimientos**: Positivos, negativos y neutros
- **Gráficos Visuales**: Barras y tortas interactivas
- **Resumen IA**: Análisis detallado generado por Gemini
- **Métricas en Tiempo Real**: Porcentajes y totales

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **IA**: Google Gemini AI
- **Backend**: Next.js API Routes

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ instalado
- Una API key de Google Gemini AI

### Pasos

1. **Clona el repositorio**:

   ```bash
   git clone https://github.com/tu-usuario/social-media-analyzer.git
   cd social-media-analyzer
   ```

2. **Instala dependencias**:

   ```bash
   npm install
   ```

3. **Configura tu API key**:

   - Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crea una nueva API key
   - Copia el archivo `.env.local` y reemplaza:

   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```

4. **Ejecuta el proyecto**:

   ```bash
   npm run dev
   ```

5. **Abre tu navegador** en `http://localhost:3000`

## 🎯 Uso

1. **Copia una URL** de un post de Instagram, Facebook o cualquier red social
2. **Pégala en el campo de entrada** de la aplicación
3. **Haz clic en "Analizar"** y espera el procesamiento
4. **Revisa los resultados**: estadísticas, gráficos y resumen de IA

### Ejemplo de URLs soportadas:

- `https://instagram.com/p/ejemplo`
- `https://facebook.com/post/123456`
- `https://twitter.com/usuario/status/123`

## 📊 Funcionalidades Principales

### 1. Análisis de Sentimientos

- Clasifica comentarios como positivos, negativos o neutros
- Calcula porcentajes y totales
- Genera métricas detalladas

### 2. Visualizaciones

- **Gráfico de Barras**: Distribución de sentimientos
- **Gráfico Circular**: Proporción visual de cada categoría
- **Tarjetas de Stats**: Métricas clave destacadas

### 3. Resumen IA

- Análisis contextual generado por Gemini AI
- Insights y tendencias identificadas
- Recomendaciones basadas en los datos

## 🔧 Desarrollo

### Estructura del Proyecto

```
src/
├── app/
│   ├── api/analyze/
│   │   └── route.ts          # API endpoint para Gemini AI
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página principal
├── components/              # Componentes reutilizables (futuro)
└── lib/                    # Utilidades (futuro)
```

### Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

## 🚧 Próximas Funcionalidades

- [ ] Extracción real de comentarios de APIs de redes sociales
- [ ] Autenticación OAuth para acceso a posts privados
- [ ] Exportación de reportes en PDF
- [ ] Análisis histórico y comparativas
- [ ] Integración con más plataformas (TikTok, YouTube, etc.)
- [ ] Dashboard administrativo
- [ ] API pública para desarrolladores

## ⚠️ Limitaciones Actuales

**Este es un prototipo** que utiliza comentarios simulados para demostrar la funcionalidad. Para una versión completa, necesitarías:

1. **APIs oficiales** de cada plataforma de red social
2. **Autenticación OAuth** para acceder a contenido
3. **Web scraping legal** respetando términos de servicio
4. **Procesamiento de grandes volúmenes** de datos

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Google Gemini AI** por la potente API de análisis
- **Next.js** por el excelente framework
- **Tailwind CSS** por los estilos utilitarios
- **Recharts** por las visualizaciones
- **Lucide** por los iconos

## 📞 Contacto

- **Desarrollador**: Tu Nombre
- **Email**: tu.email@ejemplo.com
- **LinkedIn**: [tu-perfil](https://linkedin.com/in/tu-perfil)
- **GitHub**: [tu-usuario](https://github.com/tu-usuario)

---

**⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!**
