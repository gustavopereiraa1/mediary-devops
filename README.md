# Mediary — Diário de Sintomas

Aplicação web para registrar e acompanhar sintomas: front-end em **React**, servidor **Node.js (Express)**, API **Flask** e banco **PostgreSQL**, com pipeline completo de **CI/CD** no GitHub Actions e deploy em **AWS EC2** com **Docker**.

Trabalho N3 da disciplina **Ferramentas de Implantação Contínua — DevOps**.

**Integrantes:** _(preencher)_

---

## Arquitetura

```
Navegador ──> EC2 :80 ──> app (Node.js/Express :3000) ──/api──> api (Flask :5000) ──> db (PostgreSQL)
                          └─ entrega o front React (dist)
```

| Pasta / arquivo | O que é |
|---|---|
| `src/` | Front-end React (páginas, componentes, chamadas à API) |
| `server/` | Servidor Node.js (Express): entrega o front compilado e repassa `/api` para a API Flask |
| `api/` | API REST em Flask + PostgreSQL (login, cadastro e CRUD de sintomas) |
| `tests/unit/` | Testes de unidade (Vitest) com cobertura |
| `tests/ui/` | Teste de interface com **Selenium** (Chrome headless) |
| `Dockerfile` | Imagem do app Node (build do React + servidor Express) |
| `api/Dockerfile` | Imagem da API Flask (gunicorn) |
| `docker-compose.yaml` | Sobe app + api + banco no servidor |
| `.github/workflows/ci.yaml` | **CI + Continuous Delivery** |
| `.github/workflows/cd.yaml` | **Continuous Deployment** na EC2 |

---

## Fluxo de branches e pipeline

```
feature/*  ──PR──>  develop  ──(CI)──>  main  ──(CD)──>  EC2
```

1. Cada funcionalidade é feita numa branch `feature/...` criada a partir da `develop`.
2. O Pull Request para a `develop` dispara o **CI** (`ci.yaml`):
   - `npm ci` — instala as dependências
   - `npm run lint` — **análise de código estático** (oxlint)
   - `npm test` — **testes de unidade com cobertura** (Vitest + v8)
   - `npm run build` — compila o front-end
   - `npm run test:ui` — sobe a aplicação e roda o **teste de interface com Selenium**
   - job `delivery` — se tudo passou, faz o **merge da `develop` na `main`** (Continuous Delivery)
3. O push na `main` dispara o **CD** (`cd.yaml`):
   - gera as imagens `mediary-app` e `mediary-api` com as tags `latest` e o SHA do commit
   - envia as imagens para o **Docker Hub**
   - conecta na **EC2 via SSH**, baixa as imagens novas e reinicia os containers com `docker compose`

---

## Rodando localmente

Pré-requisito: Node.js 24.

```bash
npm install
npm run dev          # front em http://localhost:5173 (precisa da API em :5000 para login/sintomas)
npm run lint         # análise estática
npm test             # testes de unidade + cobertura
npm run build        # gera a pasta dist
npm start            # servidor Node em http://localhost:3000
npm run test:ui      # teste Selenium (com o servidor rodando)
```

API Flask (pasta `api/`): veja as variáveis `DATABASE_URL` e `SECRET_KEY` no topo de `api/app.py`.

---

## Configuração do deploy (uma vez só)

### 1. Docker Hub
Crie os repositórios públicos **`mediary-app`** e **`mediary-api`** e um *Personal access token* com permissão **Read & Write**.

### 2. GitHub — Settings → Secrets and variables → Actions

**Secrets**

| Nome | Valor |
|---|---|
| `ACCESS_TOKEN` | Token do GitHub (classic, escopo `repo`) usado no merge automático para a `main` |
| `DOCKERHUB_TOKEN` | Token do Docker Hub |
| `SSH_PRIVATE_KEY` | Conteúdo da chave `.pem` da EC2 |
| `EC2_HOST` | IP público da EC2 |
| `POSTGRES_PASSWORD` | Senha do banco (use só letras e números) |
| `SECRET_KEY` | Texto longo e aleatório para as sessões da API |

**Variables**

| Nome | Valor |
|---|---|
| `DOCKERHUB_USERNAME` | Usuário do Docker Hub |

### 3. EC2 (via SSH)

- No **Security Group**, libere a porta **80** (HTTP).
- Docker instalado (`docker compose version` deve funcionar sem `sudo`).
- Pasta do projeto:

```bash
sudo mkdir -p /opt/mediary-devops && sudo chown ubuntu:ubuntu /opt/mediary-devops
```

- Se o **Nginx** estiver instalado, ele ocupa a porta 80. Desative:

```bash
sudo systemctl disable --now nginx
```

---

## Comandos úteis no servidor

```bash
cd /opt/mediary-devops
docker compose ps          # containers rodando
docker compose logs -f     # logs
docker compose restart     # reiniciar
```

**Rollback** para uma versão anterior (tag = SHA do commit):

```bash
docker pull <usuario>/mediary-app:<sha>
docker tag <usuario>/mediary-app:<sha> <usuario>/mediary-app:latest
docker compose up -d
```

---

## Roteiro da apresentação

1. Abrir `http://<ip_do_servidor>` no navegador e mostrar o Mediary rodando (criar conta, registrar um sintoma).
2. Criar uma branch de feature a partir da `develop` e alterar algo visível (ex.: o título em `src/pages/Home.jsx`):

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/altera-titulo
   git add .
   git commit -m "altera titulo da pagina inicial"
   git push -u origin feature/altera-titulo
   ```

3. Abrir o **Pull Request** para a `develop` e fazer o merge.
4. Mostrar na aba **Actions** o **CI** (lint, testes, cobertura, Selenium e merge na `main`) e em seguida o **CD** (imagens no Docker Hub e deploy na EC2).
5. Recarregar `http://<ip_do_servidor>` e mostrar a alteração no ar.
