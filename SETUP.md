# Cómo publicar este README en tu perfil

1. Crea un repositorio **público** llamado exactamente `Kheyvin` (mismo nombre que tu usuario): https://github.com/new
2. Marca "Add a README file" o súbelo vacío.
3. Copia en la raíz del repo:
   - `README.md`
   - carpeta `assets/` (con `header.svg` y `divider.svg`)
   - carpeta `.github/` (con el workflow del snake)
4. Haz commit y push. GitHub mostrará el README en tu perfil automáticamente.

## Snake de contribuciones

El workflow [`.github/workflows/snake.yml`](.github/workflows/snake.yml) usa [Platane/snk](https://github.com/Platane/snk) para generar dos SVG y publicarlos en la rama `output`:

| Archivo | Tema |
|---------|------|
| `github-contribution-grid-snake-dark.svg` | Oscuro (serpiente `#FF0A2E`) |
| `github-contribution-grid-snake.svg` | Claro (serpiente `#C8102E`) |

Se ejecuta en cada push a `main` y cada 12 horas. La primera vez:

1. Ve a **Settings → Actions → General → Workflow permissions** y marca **Read and write permissions**.
2. Ve a **Actions → generate snake → Run workflow**.
3. Cuando termine, existirá la rama `output` y el README mostrará el snake (el `<picture>` elige la versión según el tema de quien visita).

Notas:

- Si quieres que cuenten tus contribuciones privadas, activa **Private contributions** en la configuración de tu perfil.
- GitHub pausa los workflows programados tras 60 días sin actividad en el repo; si el snake deja de actualizarse, vuelve a lanzarlo desde Actions.
- Para cambiar colores, edita `color_snake` y `color_dots` (5 colores: vacío → máximo) en el workflow.
- Si prefieres no usarlo, borra el workflow y el bloque `<!-- Snake de contribuciones -->` del README.

## Paleta usada

| Rol        | Hex       |
|------------|-----------|
| Fondo      | `#0b0b0e` / `#141417` |
| Rojo neón  | `#FF0A2E` |
| Carmesí    | `#C8102E` |
| Rojo claro | `#FF3B5C` |
| Texto      | `#b8b8c2` |

Para cambiar los colores: edita los `stop-color` en `assets/header.svg` y `assets/divider.svg`, y los parámetros `bg_color`, `title_color`, `icon_color`, `text_color` en las URLs del README.
