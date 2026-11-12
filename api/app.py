"""
MeDiary — Backend Flask
Banco de dados: PostgreSQL via psycopg 3

Configuração por variáveis de ambiente (veja .env.example):
    DATABASE_URL     postgresql://usuario:senha@host:5432/mediary   (obrigatória)
    SECRET_KEY       chave das sessões Flask                        (obrigatória em produção)
    APP_TIMEZONE     fuso usado para "dia" do calendário            (padrão America/Sao_Paulo)
    CORS_ORIGINS     origens do frontend, separadas por vírgula     (padrão http://localhost:5173)
    COOKIE_SECURE    "true" em produção com HTTPS                   (padrão false)
"""
import os
from contextlib import contextmanager
from datetime import datetime, date, timedelta, timezone
from functools import wraps
from zoneinfo import ZoneInfo

import psycopg
from psycopg import errors as pg_errors
from psycopg.rows import dict_row
from flask import Flask, request, session, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

try:  # carrega o .env em desenvolvimento, se o python-dotenv estiver instalado
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


# ── Configuração ───────────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "Defina a variável DATABASE_URL, ex.: "
        "postgresql://mediary:mediary@localhost:5432/mediary"
    )

APP_TZ_NAME = os.environ.get("APP_TIMEZONE", "America/Sao_Paulo")
APP_TZ = ZoneInfo(APP_TZ_NAME)

CORS_ORIGINS = [
    o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()
]
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=CORS_ORIGINS)
app.secret_key = os.environ.get("SECRET_KEY", "medidiary-dev-secret-key-change-in-prod")

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    # Frontend e backend em domínios diferentes com HTTPS exigem SameSite=None + Secure
    SESSION_COOKIE_SAMESITE="None" if COOKIE_SECURE else "Lax",
    SESSION_COOKIE_SECURE=COOKIE_SECURE,
)


# ── Conexão PostgreSQL ─────────────────────────────────────────────────────────
@contextmanager
def get_db():
    """
    Abre uma conexão, faz commit se tudo deu certo e rollback se deu erro.
    O fuso da sessão é o APP_TIMEZONE, então `inicio::date` devolve o dia local.
    """
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT set_config('TimeZone', %s, false)", (APP_TZ_NAME,))
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Cria as tabelas se ainda não existirem (o schema.sql é idempotente)."""
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, encoding="utf-8") as f:
        schema = f.read()
    with get_db() as conn:
        conn.execute(schema)


if os.environ.get("SKIP_INIT_DB", "false").lower() != "true":
    init_db()


# ── Datas ──────────────────────────────────────────────────────────────────────
def parse_data(valor):
    """
    Aceita o que o frontend envia e devolve um datetime COM fuso:
      - 'YYYY-MM-DD HH:MM:SS'  -> horário local (APP_TIMEZONE)
      - ISO 8601 ('...T...Z' ou com offset)
    Lança ValueError se o formato for inválido.
    """
    if isinstance(valor, datetime):
        return valor if valor.tzinfo else valor.replace(tzinfo=APP_TZ)
    texto = str(valor).strip()
    if "T" in texto:
        dt = datetime.fromisoformat(texto.replace("Z", "+00:00"))
    else:
        dt = datetime.strptime(texto, "%Y-%m-%d %H:%M:%S")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=APP_TZ)
    return dt


def fmt_data(dt):
    """Formata para o frontend no mesmo padrão de antes: 'YYYY-MM-DD HH:MM:SS' (horário local)."""
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    return dt.astimezone(APP_TZ).strftime("%Y-%m-%d %H:%M:%S")


def sintoma_to_json(row):
    d = dict(row)
    for campo in ("inicio", "fim", "criado_em", "atualizado_em"):
        if campo in d:
            d[campo] = fmt_data(d[campo])
    return d


def validar_periodo(inicio, fim):
    """Valida início/fim. Retorna (ini_dt, fim_dt, erro)."""
    agora = datetime.now(timezone.utc)
    um_ano_atras = agora - timedelta(days=365)
    tolerancia = timedelta(minutes=5)

    try:
        ini_dt = parse_data(inicio)
    except (ValueError, TypeError):
        return None, None, "Formato de data de início inválido ou data inexistente"

    if ini_dt > agora + tolerancia:
        return None, None, "A data de início não pode ser futura"
    if ini_dt < um_ano_atras:
        return None, None, "O registro é limitado a no máximo 1 ano atrás"

    fim_dt = None
    if fim:
        try:
            fim_dt = parse_data(fim)
        except (ValueError, TypeError):
            return None, None, "Formato de data de fim inválido ou data inexistente"
        if fim_dt < ini_dt:
            return None, None, "A data de término não pode ser anterior à de início"
        if fim_dt > agora + tolerancia:
            return None, None, "A data de término não pode ser futura"

    return ini_dt, fim_dt, None


def limites_mes(ano, mes):
    primeiro = date(ano, mes, 1)
    proximo = date(ano + (mes == 12), mes % 12 + 1, 1)
    return primeiro, proximo


# ── Tipos de sintoma disponíveis ───────────────────────────────────────────────
SINTOMAS = [
    {"key": "DOR",         "label": "DOR",        "icon": "💢"},
    {"key": "NAUSEA",      "label": "NÁUSEA",     "icon": "🤢"},
    {"key": "FADIGA",      "label": "FADIGA",     "icon": "😴"},
    {"key": "VERTIGEM",    "label": "VERTIGEM",   "icon": "💫"},
    {"key": "FALTA_AR",    "label": "FALTA DE AR","icon": "😮‍💨"},
    {"key": "TOSSE",       "label": "TOSSE",      "icon": "🤧"},
    {"key": "DIARREIA",    "label": "DIARRÉIA",   "icon": "🚽"},
    {"key": "CONSTIPACAO", "label": "CONSTIPAÇÃO","icon": "🫃"},
    {"key": "COCEIRA",     "label": "COCEIRA",    "icon": "🖐️"},
    {"key": "OUTRO",       "label": "OUTRO",      "icon": "•••"},
]
TIPOS_VALIDOS = {s["key"] for s in SINTOMAS}

SUBTIPOS_DOR = [
    "CABEÇA", "ABDOMINAL", "MUSCULAR", "COSTAS",
    "ARTICULAÇÃO", "GARGANTA", "OUTRO"
]


def validar_tipo(tipo, subtipo):
    if tipo not in TIPOS_VALIDOS:
        return "Tipo de sintoma inválido"
    if subtipo and tipo != "DOR":
        return "Subtipo só é permitido para DOR"
    return None


# ── Decorator de autenticação ──────────────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "usuario_id" not in session:
            return jsonify({"error": "Não autorizado"}), 401
        return f(*args, **kwargs)
    return decorated


# ── Rotas de Autenticação ──────────────────────────────────────────────────────
@app.route("/api/me", methods=["GET"])
def me():
    if "usuario_id" in session:
        try:
            with get_db() as conn:
                row = conn.execute(
                    "SELECT id, nome, email, alergias FROM usuarios WHERE id = %s",
                    (session["usuario_id"],),
                ).fetchone()
            if row:
                return jsonify({
                    "id": row["id"],
                    "nome": row["nome"],
                    "email": row["email"],
                    "alergias": row["alergias"] or ""
                })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Não logado"}), 401


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    senha = data.get("senha", "")

    try:
        with get_db() as conn:
            row = conn.execute(
                "SELECT id, nome, email, alergias, senha_hash FROM usuarios WHERE lower(email) = %s",
                (email,),
            ).fetchone()

        if row and check_password_hash(row["senha_hash"], senha):
            session["usuario_id"] = row["id"]
            session["usuario_nome"] = row["nome"]
            return jsonify({
                "message": "Login realizado com sucesso",
                "user": {
                    "id": row["id"],
                    "nome": row["nome"],
                    "email": row["email"],
                    "alergias": row["alergias"] or ""
                }
            })
        return jsonify({"error": "E-mail ou senha incorretos"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/cadastro", methods=["POST"])
def cadastro():
    data = request.json or {}
    nome  = data.get("nome", "").strip()
    email = data.get("email", "").strip().lower()
    senha = data.get("senha", "")

    if not nome or not email or not senha:
        return jsonify({"error": "Preencha todos os campos"}), 400

    if len(senha) < 6:
        return jsonify({"error": "A senha deve ter pelo menos 6 caracteres"}), 400

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO usuarios (nome, email, senha_hash) VALUES (%s, %s, %s)",
                (nome, email, generate_password_hash(senha)),
            )
        return jsonify({"message": "Conta criada com sucesso!"}), 201
    except pg_errors.UniqueViolation:
        return jsonify({"error": "E-mail já cadastrado"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/usuario", methods=["PUT"])
@login_required
def update_usuario():
    data = request.json or {}
    nome = (data.get("nome") or "").strip()
    email = (data.get("email") or "").strip().lower()
    alergias = data.get("alergias", "")

    if not nome or not email:
        return jsonify({"error": "Nome e e-mail são obrigatórios"}), 400

    try:
        with get_db() as conn:
            conn.execute(
                "UPDATE usuarios SET nome=%s, email=%s, alergias=%s WHERE id=%s",
                (nome, email, alergias, session["usuario_id"]),
            )

        session["usuario_nome"] = nome
        return jsonify({
            "message": "Perfil atualizado com sucesso",
            "nome": nome,
            "email": email,
            "alergias": alergias
        })
    except pg_errors.UniqueViolation:
        return jsonify({"error": "Este e-mail já está em uso por outro usuário"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/usuario/senha", methods=["PUT"])
@login_required
def update_senha():
    data = request.json or {}
    senha_atual = data.get("senha_atual")
    senha_nova = data.get("senha_nova")

    if not senha_atual or not senha_nova:
        return jsonify({"error": "Preencha todos os campos"}), 400

    try:
        with get_db() as conn:
            row = conn.execute(
                "SELECT senha_hash FROM usuarios WHERE id = %s", (session["usuario_id"],)
            ).fetchone()

            if not (row and check_password_hash(row["senha_hash"], senha_atual)):
                return jsonify({"error": "Senha atual incorreta"}), 401

            conn.execute(
                "UPDATE usuarios SET senha_hash=%s WHERE id=%s",
                (generate_password_hash(senha_nova), session["usuario_id"]),
            )
        return jsonify({"message": "Senha atualizada com sucesso"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logout realizado com sucesso"})


# ── Calendário ─────────────────────────────────────────────────────────────────
# Regra (igual à versão SQLite): sintoma sem fim aparece só no dia do início;
# com fim, aparece em todos os dias entre início e fim.

@app.route("/api/sintomas/calendario")
@login_required
def api_calendario_info():
    ano = int(request.args.get("ano", date.today().year))
    mes = int(request.args.get("mes", date.today().month))
    primeiro, proximo = limites_mes(ano, mes)

    try:
        with get_db() as conn:
            # generate_series cria uma linha por dia coberto pelo sintoma,
            # já cortado nos limites do mês, e conta quantos sintomas há em cada dia.
            rows = conn.execute(
                """SELECT to_char(d, 'YYYY-MM-DD') AS dia, COUNT(*) AS total
                     FROM sintomas s,
                          generate_series(
                              GREATEST(s.inicio::date, %(primeiro)s::date),
                              LEAST(COALESCE(s.fim, s.inicio)::date, %(proximo)s::date - 1),
                              interval '1 day'
                          ) AS d
                    WHERE s.usuario_id = %(uid)s
                      AND s.inicio::date < %(proximo)s::date
                      AND COALESCE(s.fim, s.inicio)::date >= %(primeiro)s::date
                    GROUP BY d
                    ORDER BY d""",
                {"uid": session["usuario_id"], "primeiro": primeiro, "proximo": proximo},
            ).fetchall()
        return jsonify({r["dia"]: int(r["total"]) for r in rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/sintomas/dia")
@login_required
def api_sintomas_dia():
    data_sel = request.args.get("data")  # yyyy-mm-dd
    if not data_sel:
        return jsonify({"error": "Data não informada"}), 400
    try:
        dia = date.fromisoformat(data_sel)
    except ValueError:
        return jsonify({"error": "Data inválida, use YYYY-MM-DD"}), 400

    try:
        with get_db() as conn:
            rows = conn.execute(
                """SELECT id, tipo, subtipo, descricao, inicio, fim
                     FROM sintomas
                    WHERE usuario_id = %(uid)s
                      AND inicio::date <= %(dia)s
                      AND COALESCE(fim, inicio)::date >= %(dia)s
                    ORDER BY inicio""",
                {"uid": session["usuario_id"], "dia": dia},
            ).fetchall()
        return jsonify([sintoma_to_json(r) for r in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── CRUD de Sintomas ───────────────────────────────────────────────────────────
@app.route("/api/sintomas", methods=["POST"])
@login_required
def api_adicionar_sintoma():
    data = request.json or {}
    tipo       = data.get("tipo", "")
    subtipo    = data.get("subtipo") or None
    descricao  = data.get("descricao") or None
    inicio     = data.get("inicio")
    fim        = data.get("fim")

    if not tipo or not inicio:
        return jsonify({"error": "Tipo e início são obrigatórios"}), 400

    erro = validar_tipo(tipo, subtipo)
    if erro:
        return jsonify({"error": erro}), 400

    ini_dt, fim_dt, erro = validar_periodo(inicio, fim)
    if erro:
        return jsonify({"error": erro}), 400

    try:
        with get_db() as conn:
            row = conn.execute(
                """INSERT INTO sintomas (usuario_id, tipo, subtipo, descricao, inicio, fim)
                   VALUES (%s, %s, %s, %s, %s, %s)
                   RETURNING id""",
                (session["usuario_id"], tipo, subtipo, descricao, ini_dt, fim_dt),
            ).fetchone()
        return jsonify({"message": "Sintoma adicionado com sucesso", "id": row["id"]}), 201
    except pg_errors.CheckViolation:
        return jsonify({"error": "Dados do sintoma inválidos"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/sintomas/<int:sintoma_id>", methods=["PUT", "DELETE"])
@login_required
def api_sintoma_detail(sintoma_id):
    if request.method == "DELETE":
        try:
            with get_db() as conn:
                conn.execute(
                    "DELETE FROM sintomas WHERE id=%s AND usuario_id=%s",
                    (sintoma_id, session["usuario_id"]),
                )
            return jsonify({"message": "Sintoma excluído"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # PUT (Editar)
    data = request.json or {}
    try:
        with get_db() as conn:
            atual = conn.execute(
                "SELECT * FROM sintomas WHERE id=%s AND usuario_id=%s",
                (sintoma_id, session["usuario_id"]),
            ).fetchone()

            if not atual:
                return jsonify({"error": "Sintoma não encontrado"}), 404

            tipo      = data.get("tipo", atual["tipo"])
            subtipo   = data.get("subtipo", atual["subtipo"]) or None
            descricao = data.get("descricao", atual["descricao"]) or None
            inicio    = data.get("inicio", atual["inicio"])
            fim       = data.get("fim", atual["fim"])

            erro = validar_tipo(tipo, subtipo)
            if erro:
                return jsonify({"error": erro}), 400

            ini_dt, fim_dt, erro = validar_periodo(inicio, fim)
            if erro:
                return jsonify({"error": erro}), 400

            # atualizado_em é preenchido pelo trigger do banco
            conn.execute(
                """UPDATE sintomas
                      SET tipo=%s, subtipo=%s, descricao=%s, inicio=%s, fim=%s
                    WHERE id=%s AND usuario_id=%s""",
                (tipo, subtipo, descricao, ini_dt, fim_dt, sintoma_id, session["usuario_id"]),
            )
        return jsonify({"message": "Sintoma atualizado"})
    except pg_errors.CheckViolation:
        return jsonify({"error": "Dados do sintoma inválidos"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── API de Sintomas por Mês ───────────────────────────────────────────────────
@app.route("/api/sintomas/mes/<int:ano>/<int:mes>")
@login_required
def api_sintomas_mes(ano, mes):
    if not 1 <= mes <= 12:
        return jsonify({"error": "Mês inválido"}), 400
    primeiro, proximo = limites_mes(ano, mes)
    try:
        with get_db() as conn:
            rows = conn.execute(
                """SELECT id, tipo, subtipo, descricao, inicio, fim
                     FROM sintomas
                    WHERE usuario_id = %(uid)s
                      AND inicio::date < %(proximo)s
                      AND COALESCE(fim, inicio)::date >= %(primeiro)s
                    ORDER BY inicio""",
                {"uid": session["usuario_id"], "primeiro": primeiro, "proximo": proximo},
            ).fetchall()
        return jsonify([sintoma_to_json(r) for r in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health")
def health():
    """Usado por Docker/servidor para saber se a API e o banco estão de pé."""
    try:
        with get_db() as conn:
            conn.execute("SELECT 1")
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"status": "erro", "detalhe": str(e)}), 503


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", "true").lower() == "true",
            host=os.environ.get("HOST", "127.0.0.1"),
            port=int(os.environ.get("PORT", 5000)))
