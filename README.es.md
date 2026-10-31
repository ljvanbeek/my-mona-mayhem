🌐 [English](README.md) | Español | [Português (Brasil)](README.pt_BR.md) | [한국어](README.ko.md)

# 🎮 Mona Mayhem

**Taller de VS Code y GitHub Copilot CLI** — Crea una arena de batalla de contribuciones de GitHub

Plantilla de taller para crear con Astro un sitio web con estética de arcade retro que compara los gráficos de contribuciones de GitHub de dos usuarios. Este es el **punto de partida**: crearás la aplicación paso a paso con GitHub Copilot.

![Captura de pantalla de Mona Mayhem](https://github.com/user-attachments/assets/5eca79e2-cb9f-4e93-aa0d-23666ebde3b7)
*El resultado que crearás al terminar el taller*

## 📚 Taller

El taller ofrece dos itinerarios: sigue el que mejor se adapte a tu forma de trabajar.

- **Itinerario de VS Code** — Chat, Plan Mode, Agent Mode, agentes en segundo plano y flujos de revisión integrados en el editor
- **Itinerario de CLI** — `copilot`, contexto con `@file`, `/plan`, ediciones autónomas, `/fleet`, `/delegate` y `/review`

| Parte | Título | Enfoque de Copilot |
|------|-------|--------------------|
| [00](workshop/es/00-overview.md) | Descripción general | Elección del itinerario y objetivos de aprendizaje |
| [01](workshop/es/01-setup.md) | Configuración e ingeniería de contexto | Instrucciones, permisos y configuración del entorno |
| [02](workshop/es/02-plan-and-scaffold.md) | Planificación y estructura inicial | Planificación de la API y la arquitectura de páginas |
| [03](workshop/es/03-agent-mode.md) | Crear el juego | Implementación agéntica e iteración |
| [04](workshop/es/04-design-vibes.md) | Tematización orientada al diseño | Planificación e implementación del diseño visual |
| [05](workshop/es/05-polish.md) | Pulido y trabajo en paralelo | Paralelismo, revisiones y controles de calidad |
| [06](workshop/es/06-bonus.md) | Extras y ampliaciones | Ideas de funcionalidades abiertas y experimentos adicionales con Copilot |

## 🚀 Inicio rápido

1. **Crea primero tu propio repositorio** de una de estas formas:
   - haz clic en **Use this template** para crear un repositorio nuevo, o
   - crea una bifurcación de este repositorio.
2. Elige cómo seguir el taller:
   - **VS Code:** clona tu repositorio y ábrelo en VS Code.
   - **GitHub Copilot CLI:** clona tu repositorio localmente, instala `copilot` y trabaja desde el terminal.
3. Sigue la [guía del taller](workshop/es/00-overview.md).

## Requisitos previos

### Comunes

- GitHub Copilot (Pro, Business o Enterprise)
- Git
- Node.js

## Calidad del código

Ejecuta `npm run lint` para comprobar el código de la aplicación y la configuración del linter.

### Itinerario de VS Code

- VS Code v1.107+
- Sesión iniciada en la extensión GitHub Copilot

### Itinerario de CLI

- GitHub Copilot CLI (`copilot`)
- Node.js 22+ si tienes previsto instalar la CLI con `npm install -g @github/copilot`
- También puedes instalarla con Homebrew o WinGet

## Tecnologías

- **Framework**: [Astro](https://astro.build/) v6
- **Entorno de ejecución**: Node.js con el adaptador [@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/)
- **Fuente**: Press Start 2P (fuente de juegos retro)
- **API**: API del gráfico de contribuciones de GitHub

## API de contribuciones

El endpoint del servidor `GET /api/contributions/:username` obtiene de GitHub los datos de contribuciones en formato JSON. Por ejemplo, un cliente del navegador puede solicitar `/api/contributions/octocat` al origen de la aplicación, sin llamar directamente a GitHub ni necesitar acceso entre orígenes. Las respuestas correctas se almacenan en caché durante un minuto por proceso del servidor; las respuestas de error no se almacenan.

Los nombres de usuario no válidos devuelven `400`, los usuarios de GitHub desconocidos devuelven `404`, los fallos del servicio ascendente devuelven `502` y los tiempos de espera del servicio ascendente devuelven `504`. Los errores usan la estructura JSON `{ "error": "..." }`.

## Notas de implementación

### Configuración actual de GitHub Pages

El flujo de trabajo de `.github/workflows/deploy.yml` implementa actualmente en GitHub Pages el contenido estático del taller y la documentación de `docs/` y `workshop/`. No compila ni implementa la aplicación Astro de `src/`.

### Si quieres implementar la aplicación Astro en GitHub Pages

GitHub Pages es un servicio de alojamiento estático, por lo que la aplicación Astro debe usar una salida estática.

1. Cambia `output` de `server` a `static` en `astro.config.mjs`.
2. Elimina el adaptador de Node (`@astrojs/node`) de `astro.config.mjs` y `package.json`.
3. Actualiza el flujo de trabajo de GitHub Actions para ejecutar `npm ci` y `npm run build`, y después cargar `dist/` como artefacto de Pages.
4. Si implementas en una página de proyecto (`https://<user>.github.io/<repo>/`), configura `site` y `base` en `astro.config.mjs`.

Si quieres mantener las rutas de API en producción, utiliza una plataforma de servidor en lugar de GitHub Pages, como Vercel, Netlify o un servidor Node.

## Licencia

MIT
