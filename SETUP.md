# Cómo publicar este README en tu perfil

1. Crea un repositorio **público** llamado exactamente `Kheyvin` (mismo nombre que tu usuario): https://github.com/new
2. Marca "Add a README file" o súbelo vacío.
3. Copia en la raíz del repo:
   - `README.md`
   - carpeta `assets/` (con `header.svg` y `divider.svg`)
   - carpeta `.github/` (workflow + script que generan las tarjetas)
4. Haz commit y push. GitHub mostrará el README en tu perfil automáticamente.

## Tarjetas del perfil (stats, trofeos, snake…)

Las instancias públicas de `github-readme-stats`, `github-profile-trophy` y `github-readme-activity-graph` en Vercel están pausadas o deshabilitadas, así que todas las tarjetas se generan **dentro de tu propio repo** con el workflow [`.github/workflows/profile.yml`](.github/workflows/profile.yml) y se publican en la rama `output`:

| Archivo en `output` | Generado con |
|---|---|
| `stats.svg`, `top-langs.svg`, `pin-<repo>.svg` | [stats-organization/github-readme-stats-action](https://github.com/stats-organization/github-readme-stats-action) |
| `trophies.svg`, `activity.svg` | [`.github/scripts/profile-cards.mjs`](.github/scripts/profile-cards.mjs) (propio, sin dependencias) |
| `github-contribution-grid-snake(-dark).svg` | [Platane/snk](https://github.com/Platane/snk) |

Se ejecuta en cada push a `main` y cada 12 horas. La primera vez:

1. Ve a **Settings → Actions → General → Workflow permissions** y marca **Read and write permissions**.
2. Ve a **Actions → generate profile assets → Run workflow**.
3. Cuando termine, existirá la rama `output` y el README mostrará todas las tarjetas.

Notas:

- **Repos privados:** con el token por defecto solo se cuentan datos públicos. Para incluir los privados, crea un [token clásico](https://github.com/settings/tokens) con scopes `repo` y `read:user`, y guárdalo como secret `STATS_TOKEN` en **Settings → Secrets and variables → Actions**. El workflow lo usa automáticamente si existe.
- Activa **Private contributions** en tu perfil para que el snake y el gráfico de actividad cuenten tus contribuciones privadas.
- Si algún paso falla (p. ej. límite de la API), no se publica nada y se mantienen las tarjetas anteriores.
- GitHub pausa los workflows programados tras 60 días sin actividad en el repo; si dejan de actualizarse, vuelve a lanzarlo desde Actions.
- Para fijar otro repo, duplica un paso `Pin …` en el workflow y añade su `<img>` en el README.
- Colores: `THEME` en el workflow (stats y pins), `C` en `profile-cards.mjs` (trofeos y actividad), `color_snake`/`color_dots` (snake).

## Paleta usada

| Rol        | Hex       |
|------------|-----------|
| Fondo      | `#0b0b0e` / `#141417` |
| Rojo neón  | `#FF0A2E` |
| Carmesí    | `#C8102E` |
| Rojo claro | `#FF3B5C` |
| Texto      | `#b8b8c2` |

Para cambiar los colores: edita los `stop-color` en `assets/header.svg` y `assets/divider.svg`, y los colores de las tarjetas en el workflow y el script (ver notas arriba).
