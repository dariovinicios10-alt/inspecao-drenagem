# Base de Dados — Inspeção de Drenagem (para planejamento)

> Documento de consulta para planejar a execução das inspeções em campo.
> Fonte: `00 - Consolidado - Projetos Cadastro.csv` publicado no app.
> **Total geral: 1.281 drenagens** (5 rodovias).

App em produção: https://dariovinicios10-alt.github.io/inspecao-drenagem/

---

## 1. Visão geral por rodovia

| Rodovia | Total | Superficial (DS) | Profunda (DP) | Faixa de KM |
|---------|------:|-----------------:|--------------:|-------------|
| BR-262  |   330 |              263 |            67 | KM 0 – 328  |
| BR-267  |   367 |              311 |            56 | KM 0 – 246  |
| MS-040  |   499 |              418 |            81 | KM 0 – 226  |
| MS-338  |    29 |               24 |             5 | KM 284 – 339|
| MS-395  |    56 |               55 |             1 | KM 64 – 72  |
| **Total** | **1.281** | **1.071** | **210** |         |

---

## 2. Distribuição por sentido (só Superficial)

| Rodovia | Leste | Oeste | Norte | Sul |
|---------|------:|------:|------:|----:|
| BR-262  |     — |   263 |     — |   — |
| BR-267  |    27 |   284 |     — |   — |
| MS-040  |   310 |   108 |     — |   — |
| MS-338  |    10 |    14 |     — |   — |
| MS-395  |     — |     — |    47 |   8 |

> Observação: a BR-262 (superficial) está **toda como "Oeste"** na base de origem.
> Verificar com o levantamento de campo se é real ou se faltou o outro sentido.
> As drenagens **profundas (DP)** não têm sentido preenchido (vazio / N/D).

---

## 3. Tipos de dispositivo

**Superficial (DS) — 1.071 no total:**

| Subtipo | Qtd |
|---------|----:|
| Meio-Fio        | 1.029 |
| Descida d'água  |    38 |
| Grelha          |     2 |
| Sarjeta         |     2 |

**Profunda (DP) — 210 no total:** todas classificadas como `DP - CONCRETO`.

---

## 4. Extensão cadastrada (Superficial)

| Rodovia | Extensão somada (aprox.) | Pontos com extensão |
|---------|-------------------------:|---------------------|
| BR-262  | ~114.000 m | 257 de 263 |
| BR-267  |  ~71.000 m | 264 de 311 |
| MS-040  | ~124.000 m | 408 de 418 |
| MS-338  |  ~15.000 m |  22 de 24  |
| MS-395  |   ~7.000 m |  16 de 55  |

---

## 5. Qualidade / lacunas dos dados (importante p/ planejamento)

- **Coordenadas DS:** presentes (lat/lon inicial e final) na maioria — vindas do LOG.
- **Coordenadas DP:** 208 de 210 têm coordenada, mas em **formato bruto**
  (ex.: `20483367S` / `51412369W`), sem separação decimal padrão. Podem precisar
  de conversão antes de usar em mapa.
- **Extensão DP:** **nenhuma** das 210 profundas tem comprimento cadastrado (todas N/D).
- **Sentido:** ausente em todas as DP; BR-262 DS só tem "Oeste".
- Campos vazios no app aparecem como **N/D** e podem ser completados em campo
  (o app tem o botão "➕ Incluir drenagem" com captura de GPS para pontos novos ou correções).

---

## 6. Sugestão de recorte para o "ataque" em campo

Ordem sugerida por volume (maior esforço primeiro):

1. **MS-040 — 499 pontos** (o maior; 310 Leste + 108 Oeste + 81 DP)
2. **BR-267 — 367 pontos** (284 Oeste + 27 Leste + 56 DP)
3. **BR-262 — 330 pontos** (263 Oeste + 67 DP)
4. **MS-395 — 56 pontos** (trecho curto, KM 64–72)
5. **MS-338 — 29 pontos** (trecho curto, KM 284–339)

Pontos de decisão para o planejamento:
- Dividir por **inspetor × trecho/sentido** (o controle de "já inspecionado" é por aparelho).
- Priorizar **DP** ou **DS** primeiro? DS domina o volume (1.071 × 210).
- MS-338 e MS-395 são trechos curtos — bons para fechar 100% rápido.
- Meio-Fio concentra 96% da DS — decidir se a abordagem de campo difere por subtipo.

---

*Gerado a partir da base publicada. Para números atualizados, reprocessar o CSV consolidado.*
