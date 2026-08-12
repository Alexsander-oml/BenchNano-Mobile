# BenchNano — Controle Mobile (versão)

Versão mobile experimental da interface do BenchNano (controle do instrumento).
Esta pasta contém uma versão estática front-end para visualização e testes locais.

## Estrutura
- `src/` — Conteúdo do site (HTML, CSS, JS)
- `src/assets/css/` — Estilos
- `src/assets/js/` — Scripts

## Como abrir localmente
Opções rápidas:

- Abrir `src/index.html` diretamente no navegador (recomendado para testes rápidos).
- Servir localmente via Python:

```bash
# a partir da pasta c:\Users\...\Benchnano
python -m http.server --directory src 8000
# depois abra http://localhost:8000
```

- Usar extensão Live Server do VS Code.

## Próximos passos sugeridos
- Extrair assets (icons, imagens) para `src/assets/img`
- Automatizar build/empacotamento se precisar publicar (ex: usar `vite` ou `parcel`)
- Adicionar testes e CI (GitHub Actions)

## Licença
MIT — veja o arquivo `LICENSE`.