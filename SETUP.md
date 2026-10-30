# Cómo publicar este README en tu perfil

1. Crea un repositorio **público** llamado exactamente `Kheyvin` (mismo nombre que tu usuario): https://github.com/new
2. Marca "Add a README file" o súbelo vacío.
3. Copia en la raíz del repo:
   - `README.md`
   - carpeta `assets/` (con `header.svg` y `divider.svg`)
4. Haz commit y push. GitHub mostrará el README en tu perfil automáticamente.

## Snake de contribuciones (opcional)

Crea `.github/workflows/snake.yml` en el mismo repo con:

```yaml
name: generate snake
on:
  schedule: [{ cron: "0 */12 * * *" }]
  workflow_dispatch:
  push: { branches: [main] }
jobs:
  build:
    runs-on: ubuntu-latest
    permissions: { contents: write }
    steps:
      - uses: Platane/snk@v3
        with:
          github_user_name: Kheyvin
          outputs: |
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark&color_snake=#ff0a2e&color_dots=#141417,#3a0a12,#7a0a1c,#c8102e,#ff3b5c
      - uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Ejecútalo una vez desde la pestaña **Actions → generate snake → Run workflow**. Si prefieres no usarlo, borra el bloque `<!-- Snake -->` del README.

## Paleta usada

| Rol        | Hex       |
|------------|-----------|
| Fondo      | `#0b0b0e` / `#141417` |
| Rojo neón  | `#FF0A2E` |
| Carmesí    | `#C8102E` |
| Rojo claro | `#FF3B5C` |
| Texto      | `#b8b8c2` |

Para cambiar los colores: edita los `stop-color` en `assets/header.svg` y `assets/divider.svg`, y los parámetros `bg_color`, `title_color`, `icon_color`, `text_color` en las URLs del README.
