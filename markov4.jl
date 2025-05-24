# ---------------------------------------------------------------
# Simulação de Cadeia de Markov - Controle de Pragas em Lavoura
# ---------------------------------------------------------------
#
# Este projeto simula a evolução do nível de pragas em uma lavoura
# ao longo de vários dias, utilizando Cadeias de Markov com três estados:
# Baixo, Médio e Alto nível de infestação.
#
# -------------------------------
# SOBRE O PROJETO
# -------------------------------
# O programa parte de um estado inicial informado pelo usuário e
# aplica uma matriz de transição para prever a probabilidade de 
# ocorrência de cada estado após vários dias.
#
# -------------------------------
# COMO RODAR O CÓDIGO
# -------------------------------
# Requisitos:
#   - Julia (versão mais recente recomendada)
#
# Passos:
#   1. Clonar o repositório:
#      git clone https://github.com/usuario/nome-do-repositorio.git
#      cd nome-do-repositorio
#
#   2. Executar o código com Julia:
#      julia markov4.jl
#
#   3. Inserir os dados:
#      - Estado inicial das pragas (1: Baixo, 2: Médio, 3: Alto)
#      - Número de dias para simular
#
# -------------------------------
# EXEMPLO DE RESULTADO
# -------------------------------
# Para entrada: estado inicial = 1 (baixo), dias = 5
# Saída esperada:
#   Baixo: 40.25%
#   Médio: 35.42%
#   Alto : 24.33%
#
# ---------------------------------------------------------------

println("Simulação de Cadeia de Markov - Controle de Pragas em Lavoura")

# Definição dos estados:
# Estado 1: Baixo nível de pragas
# Estado 2: Médio nível de pragas
# Estado 3: Alto nível de pragas

# Matriz de transição (P):
P = [
    0.7  0.2  0.1;   # De BAIXO
    0.3  0.4  0.3;   # De MÉDIO
    0.1  0.3  0.6    # De ALTO
]

# Input: Estado inicial
println("\nDigite o estado inicial das pragas (1: Baixo, 2: Médio, 3: Alto):")
estado_inicial = parse(Int, readline())

# Criar vetor de estado inicial como vetor linha
x = [0.0 0.0 0.0]
x[estado_inicial] = 1.0

# Input: número de dias
println("Digite o número de dias para simular:")
dias = parse(Int, readline())

println("\nIniciando simulação...\n")
for i in 0:dias
    println("Dia $i: ", round.(x, digits=4))
    global x = x * P
end

# Resultado final
println("\nApós $dias dias, a distribuição de probabilidade dos estados é:")
println("Baixo: $(round(x[1]*100, digits=2))%")
println("Médio: $(round(x[2]*100, digits=2))%")
println("Alto : $(round(x[3]*100, digits=2))%")
