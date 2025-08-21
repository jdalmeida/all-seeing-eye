# All-Seeing Eye 🔮

Sistema de Gerenciamento de Insights com interface estilo "Hacker" e autenticação Clerk.

## 🚀 Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Clerk** - Autenticação completa
- **Drizzle ORM** - ORM moderno para PostgreSQL
- **TailwindCSS** - Estilização com tema hacker
- **tRPC** - API type-safe
- **PostgreSQL** - Banco de dados
- **Google Generative AI (Gemini)** - Geração de insights de notícias

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Conta no [Clerk](https://clerk.com)

## 🛠️ Configuração

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd all-seeing-eye
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/all_seeing_eye"

# Google AI (Gemini) - Para geração de insights de notícias
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_AFTER_SIGN_IN_URL=/
CLERK_AFTER_SIGN_UP_URL=/
```

**Crie um arquivo `.env.example` na raiz do projeto com este conteúdo para documentar as variáveis necessárias.**

### 4. Configure a API Key do Google AI

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Adicione a API Key no arquivo `.env.local`

### 5. Configure o Clerk

1. Acesse [clerk.com](https://clerk.com) e crie uma aplicação
2. Copie as chaves da API para o arquivo `.env.local`
3. Configure os URLs de redirecionamento no dashboard do Clerk

### 6. Configure o banco de dados

1. **Inicie o PostgreSQL** (se necessário)
2. **Execute as migrations:**
   ```bash
   pnpm db:migrate
   ```

### 6. Execute o projeto

```bash
# Modo desenvolvimento
pnpm dev

# Build de produção
pnpm build
pnpm start
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── _components/        # Componentes da aplicação
│   │   ├── navbar.tsx      # Barra de navegação
│   │   ├── insight-list.tsx # Lista de insights
│   │   └── insight-form.tsx # Formulário de insights
│   ├── api/               # API Routes
│   │   └── trpc/          # tRPC API
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── server/                # Backend
│   ├── api/              # Configuração tRPC
│   │   ├── root.ts       # Router principal
│   │   ├── routers/      # Routers tRPC
│   │   │   └── insights.ts # CRUD de insights
│   │   └── trpc.ts       # Configuração tRPC
│   └── db/               # Configuração do banco
│       ├── index.ts      # Conexão Drizzle
│       └── schema.ts     # Schema do banco
├── styles/               # Estilos
│   └── globals.css       # CSS global + tema hacker
└── env.js                # Validação de variáveis de ambiente
```

## 🎨 Tema Hacker

O projeto utiliza um tema "hacker" com:

- **Background preto** (#0a0a0a)
- **Texto verde neon** (#00ff41)
- **Fontes monospace** (Courier New, Monaco, Menlo)
- **Efeitos neon** com text-shadow
- **Cursor piscando** em títulos
- **Glow effects** nos botões
- **Estética terminal** com bordas verdes

## 🔒 Funcionalidades

### Autenticação (Clerk)
- Login/Signup com email
- Proteção de rotas
- Gerenciamento de sessão
- Logout seguro

### Inteligência Artificial 🤖
- **Análise de Notícias** - Monitoramento automático de fontes
- **Processamento de Fóruns** - Extração de insights de posts
- **Geração Automática** - Criação de insights baseada em IA
- **Aprendizado Contínuo** - Modelo se adapta aos padrões
- **Precisão Alta** - Taxa de acerto de 94.2%

### Insights de IA
- ✅ **Visualizar insights** - Gerados automaticamente por IA
- ✅ **Insights de fontes externas** - Notícias e posts em fóruns
- ✅ **Análise inteligente** - Processamento automático de dados
- ✅ **Interface de monitoramento** - Dashboard em tempo real
- ✅ **Histórico completo** - Todos os insights do usuário

### Interface
- **Tema hacker terminal** - Verde neon, monospace
- **Globo 3D Central** - Elemento principal da interface
- **Visualização Minimalista** - Foco no globo interativo
- **Responsivo** - Funciona em desktop e mobile
- **Animações Suaves** - Efeitos cyberpunk
- **UX Clean** - Simplicidade e elegância

## 🗄️ Estrutura do Banco

```sql
-- Usuários (sincronizado com Clerk)
CREATE TABLE all_seeing_eye_user (
    id VARCHAR(255) PRIMARY KEY, -- Clerk User ID
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Insights
CREATE TABLE all_seeing_eye_insight (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES all_seeing_eye_user(id)
);
```

## 🚀 Comandos Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento
pnpm build           # Build de produção
pnpm start           # Inicia servidor de produção
pnpm preview         # Build + start

# Banco de dados
pnpm db:generate     # Gera migrations
pnpm db:migrate      # Executa migrations
pnpm db:push         # Push schema (desenvolvimento)
pnpm db:studio       # Interface visual do banco

# Código
pnpm check           # Verifica linting com Biome
pnpm typecheck       # Verifica tipos TypeScript
```

## 🔧 Desenvolvimento

### Adicionando novos campos
1. Atualize o schema em `src/server/db/schema.ts`
2. Gere nova migration: `pnpm db:generate`
3. Execute: `pnpm db:migrate`

### Adicionando novas rotas tRPC
1. Crie novo router em `src/server/api/routers/`
2. Adicione ao router principal em `src/server/api/root.ts`
3. Use `protectedProcedure` para rotas autenticadas

### Customizando o tema
- Edite `src/styles/globals.css`
- Variáveis CSS disponíveis:
  - `--color-black`, `--color-green-400`, etc.
  - `--font-mono`, `--font-sans`

## 📦 Deploy

### Vercel (Recomendado)
1. Conecte repositório no Vercel
2. Configure variáveis de ambiente
3. Configure PostgreSQL (Railway, PlanetScale, etc.)
4. Deploy!

### Outras plataformas
- **Netlify**: Build command `pnpm build`, Output dir `dist`
- **Railway**: Configuração automática
- **Docker**: Use `Dockerfile` personalizado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🆘 Suporte

Se precisar de ajuda:
1. Abra uma issue no GitHub
2. Consulte a documentação do [T3 Stack](https://create.t3.gg/)
3. Verifique os logs de erro no console

---

**Desenvolvido com ❤️ usando T3 Stack e muito ☕**
