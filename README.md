# Labirinto Virtual com Algoritmo de Backtracking

Sistema interativo de labirinto virtual, desenvolvido em JavaScript, com geração procedural de labirintos e resolução automática utilizando o algoritmo de **backtracking**. A aplicação roda diretamente no navegador e permite visualização em tempo real da resolução do labirinto.

## Execução

Você pode executar o projeto de duas formas:

### Via Deploy (Recomendado)

Acesse diretamente pelo GitHub Pages:
🔗 [https://arthur-cristo.github.io/maze-backtracking/](https://arthur-cristo.github.io/maze-backtracking/)

### Via Clonagem Local

1. Clone o repositório:

   ```bash
   git clone https://github.com/arthur-cristo/maze-backtracking.git
   ```
2. Abra o arquivo `index.html` com um navegador de sua preferência.

## Objetivos

* ✅ Geração procedural de labirintos com tamanhos ajustáveis.
* ✅ Resolução visual automática com o algoritmo de backtracking.
* ✅ Interface interativa para controle do tamanho, velocidade e pausa.
* ✅ Demonstração prática de algoritmos de busca e estruturação de caminhos.

## Fundamento

O algoritmo de **backtracking** realiza uma busca sistemática por soluções, explorando possibilidades e retornando quando encontra um beco sem saída. No contexto do labirinto, ele tenta se mover entre células vizinhas, marcando caminhos visitados e recuando quando necessário, até encontrar a saída ou concluir que não há caminho.

## Metodologia

A aplicação é dividida em duas classes principais:

### `MazeGenerator`

* Cria a estrutura do labirinto com paredes externas.
* Gera paredes internas aleatórias.
* Define entrada e saída.

### `MazeGame`

* Gera a visualização do labirinto no DOM.
* Permite ajuste de tamanho e velocidade.
* Executa o algoritmo de backtracking de forma assíncrona.
* Exibe os passos e retrocessos do algoritmo em tempo real.

## Resultados

* Suporte a tamanhos de labirinto de **7x7 até 41x41** células.
* Controle de **velocidade da simulação**: de muito lento a muito rápido.
* Contadores de **passos e retrocessos** em tempo real.
* Resolução correta em todos os casos testados.
* Interface responsiva com visualização clara dos caminhos explorados.

## Conclusão

Este projeto alcançou com sucesso seus objetivos, sendo uma ferramenta eficaz tanto do ponto de vista técnico quanto educacional. A simulação visual ajuda na compreensão de algoritmos de busca, lógica de programação e estruturas de decisão.

## Autores

* Kawan Oliveira Carneiro – 12724119606
* Vinícius Paula Ribeiro – 12723131464
* Arthur Cristo e Silva – 1272323659
* Maria Clara Maluf Caldas De Souza – 1272325024
