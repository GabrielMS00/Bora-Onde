# Padrão de commits

Formato:

```
tipo: mensagem
```

Opcionalmente, com o escopo entre parênteses: `tipo(escopo): mensagem`.

## Tipos

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Funcionalidade nova | `feat: adicionar filtro por ambiente no feed` |
| `fix` | Correção de bug | `fix: corrigir foto antiga aparecendo no cache` |
| `docs` | Só documentação (README, COMMITS.md…) | `docs: atualizar passos do Supabase no README` |
| `style` | Formatação ou comentários, sem mudar o comportamento | `style: remover comentários da pasta src` |
| `refactor` | Reorganizar código sem mudar o comportamento | `refactor: separar a busca de lugares em um hook` |
| `perf` | Melhoria de desempenho | `perf: carregar fotos do carrossel sob demanda` |
| `test` | Criar ou ajustar testes | `test: cobrir o desempate do motor de indicação` |
| `build` | Dependências, versões e configuração do projeto | `build: atualizar o Expo para o SDK 57` |
| `ci` | Workflows do GitHub Actions | `ci: criar workflow de keep-alive do Supabase` |
| `chore` | Tarefas de manutenção que não se encaixam nos outros | `chore: ignorar a pasta .claude no git` |
| `revert` | Desfazer um commit anterior | `revert: desfazer a troca de cidade` |

## Regras

- Escreva em português, com o verbo no infinitivo (`adicionar`, `corrigir`, `remover`).
- Comece a mensagem em minúsculo e não termine com ponto.
- Seja curto: até cerca de 72 caracteres na primeira linha.
- Um commit por mudança. Se der para descrever com "e", talvez sejam dois commits.
- Para explicar o motivo, deixe uma linha em branco e escreva o detalhe no corpo do commit.
- Mudança que quebra algo existente: coloque `!` depois do tipo (`feat!: trocar o formato da cidade`).
