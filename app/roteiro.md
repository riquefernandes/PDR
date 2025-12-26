# Plano de Desenvolvimento: Calculadora de Rescisão (Next.js)

Este documento descreve os principais marcos e tarefas para o desenvolvimento da aplicação web da calculadora de rescisão.

---

## Milestone 1: Fundação do Projeto (Setup)

- [x] **Tarefa #1: Inicializar projeto Next.js:**
  - Usar `create-next-app` para criar a estrutura base do projeto com TypeScript.
  - Configurar ESLint e Prettier para manter a qualidade do código.

- [x] **Tarefa #2: Estrutura de Pastas e Estilo:**
  - Definir uma estrutura de pastas (ex: `/components`, `/lib`, `/styles`, `/app`).
  - Instalar e configurar uma solução de estilo (ex: Tailwind CSS).
  - Criar o layout global da aplicação.

---

## Milestone 2: UI e Lógica do Calculador

- [ ] **Tarefa #3: Criar Componente de Formulário:**
  - Desenvolver componentes React para todos os campos de entrada (datas, salário, opções, etc.).
  - Gerenciar o estado do formulário (ex: com `useState` ou `react-hook-form`).

- [ ] **Tarefa #4: Integrar Lógica de Cálculo:**
  - Mover a lógica de cálculo existente para a pasta `/lib`.
  - Criar uma API route ou Server Action que usa a lógica de cálculo.
  - Conectar o formulário do front-end para chamar a lógica no back-end.

---

## Milestone 3: Resultados e Experiência do Usuário (UX)

- [ ] **Tarefa #5: Criar Componente de Resultados:**
  - Desenvolver um componente para exibir os resultados da rescisão de forma clara (verbas, descontos, totais).
  - Adicionar estados de carregamento (loading) e erro na UI.

- [ ] **Tarefa #6: Polimento da UX e Responsividade:**
  - Garantir que a aplicação seja totalmente responsiva (mobile-first).
  - Adicionar validação de formulário no lado do cliente para feedback instantâneo.

---

## Milestone 4: Monetização e Conteúdo

- [ ] **Tarefa #7: Integração com Google AdSense:**
  - Adicionar o script do Google AdSense ao projeto.
  - Criar componentes de anúncio para posicionar em locais estratégicos.

- [ ] **Tarefa #8: Criar Páginas Estáticas:**
  - Desenvolver páginas "Sobre", "Política de Privacidade" (obrigatória para AdSense) e "Contato".
  - Adicionar um rodapé com links para essas páginas.

- [ ] **Tarefa #9: Otimização para Buscadores (SEO):**
  - Configurar metadados (título, descrição) e usar tags HTML semânticas.

---

## Milestone 5: Implantação (Deployment)

- [ ] **Tarefa #10: Deploy na Vercel:**
  - Criar um repositório no GitHub.
  - Conectar o repositório à Vercel para deploys automáticos.
  - Configurar domínio personalizado (se aplicável).
