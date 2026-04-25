#!/usr/bin/env bash
# DejaQ — start all services (Mac)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$PROJECT_DIR/.logs"
VENV="$PROJECT_DIR/.venv"
mkdir -p "$LOG_DIR"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

MODE_ARG=""
OLLAMA_URL_ARG=""
OLLAMA_URL_FLAG_SET=false
DRY_RUN=false
ENV_MODE="${DEJAQ_MODE:-}"
ENV_OLLAMA_URL="${DEJAQ_OLLAMA_URL:-}"

usage() {
  echo "Usage: $0 [--mode=in-process|self-hosted|cloud] [--ollama-url URL] [--dry-run]"
  echo ""
  echo "Environment:"
  echo "  DEJAQ_MODE         Non-interactive mode selection"
  echo "  DEJAQ_OLLAMA_URL   Required for self-hosted and cloud modes"
}

for arg in "$@"; do
  case "$arg" in
    --mode=*)
      MODE_ARG="${arg#*=}"
      ;;
    --mode)
      echo -e "${RED}Use --mode=<mode>${NC}"; exit 1
      ;;
    --ollama-url=*)
      OLLAMA_URL_ARG="${arg#*=}"
      OLLAMA_URL_FLAG_SET=true
      ;;
    --ollama-url)
      echo -e "${RED}Use --ollama-url=<url>${NC}"; exit 1
      ;;
    --dry-run)
      DRY_RUN=true
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown argument: $arg${NC}"
      usage
      exit 1
      ;;
  esac
done

# Verify the project venv exists
if [[ ! -f "$VENV/bin/python" ]]; then
  echo -e "${RED}No .venv found at $VENV. Run: uv sync${NC}"; exit 1
fi

# Use project venv executables directly — avoids any venv activated in the parent shell
PYTHON="$VENV/bin/python"
UVICORN="$VENV/bin/uvicorn"
CELERY="$VENV/bin/celery"
CHROMA="$VENV/bin/chroma"

REDIS_PID=""; CELERY_PID=""; CELERY_BEAT_PID=""; UVICORN_PID=""; CHROMA_PID=""; TAIL_PID=""

cleanup() {
  trap - EXIT INT TERM
  if [[ "$DRY_RUN" == "true" ]]; then
    return
  fi
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  stop_service() {
    local pid=$1 name=$2
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      pkill -TERM -P "$pid" 2>/dev/null || true  # kill children first
      kill -TERM "$pid" 2>/dev/null || true
      echo "  $name stopped"
    fi
  }
  [[ -n "$TAIL_PID" ]] && kill "$TAIL_PID" 2>/dev/null || true
  stop_service "$UVICORN_PID"     "FastAPI"
  stop_service "$CELERY_BEAT_PID" "Celery beat"
  stop_service "$CELERY_PID"      "Celery worker"
  stop_service "$CHROMA_PID"      "ChromaDB"
  stop_service "$REDIS_PID"       "Redis"
  echo -e "${GREEN}All services stopped.${NC}"
}
trap cleanup EXIT INT TERM

# Kill any process holding a port before we try to bind it
free_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null) || true
  if [[ -n "$pids" ]]; then
    echo -e "  ${YELLOW}Port $port already in use — clearing...${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

cd "$PROJECT_DIR"

# Load local env file so uvicorn, celery worker, and beat share the same config
if [[ -f "$PROJECT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.env"
  set +a
fi

if [[ -n "$ENV_MODE" ]]; then
  DEJAQ_MODE="$ENV_MODE"
fi
if [[ -n "$ENV_OLLAMA_URL" ]]; then
  DEJAQ_OLLAMA_URL="$ENV_OLLAMA_URL"
fi

normalize_mode() {
  case "$1" in
    in-process|in_process|inprocess|dev|development)
      echo "in-process"
      ;;
    self-hosted|self_hosted|selfhosted|on-prem|onprem|prod|production)
      echo "self-hosted"
      ;;
    cloud)
      echo "cloud"
      ;;
    *)
      echo ""
      ;;
  esac
}

select_mode() {
  local selected="${MODE_ARG:-${DEJAQ_MODE:-}}"
  if [[ -n "$selected" ]]; then
    selected="$(normalize_mode "$selected")"
    if [[ -z "$selected" ]]; then
      echo -e "${RED}Invalid DEJAQ mode. Choose in-process, self-hosted, or cloud.${NC}" >&2
      exit 1
    fi
    echo "$selected"
    return
  fi

  echo -e "${CYAN}Select deployment mode:${NC}" >&2
  echo "  1) in-process  (development)" >&2
  echo "  2) self-hosted (on-prem production via Ollama)" >&2
  echo "  3) cloud       (remote Ollama endpoint)" >&2
  read -r -p "Mode [1-3]: " selected
  case "$selected" in
    1|in-process|in_process) echo "in-process" ;;
    2|self-hosted|self_hosted) echo "self-hosted" ;;
    3|cloud) echo "cloud" ;;
    *) echo -e "${RED}Invalid mode selection.${NC}" >&2; exit 1 ;;
  esac
}

apply_mode() {
  local mode="$1"
  export DEJAQ_MODE="$mode"

  if [[ "$mode" == "in-process" ]]; then
    export DEJAQ_ENRICHER_BACKEND=in_process
    export DEJAQ_NORMALIZER_BACKEND=in_process
    export DEJAQ_LOCAL_LLM_BACKEND=in_process
    export DEJAQ_GENERALIZER_BACKEND=in_process
    export DEJAQ_CONTEXT_ADJUSTER_BACKEND=in_process
    return
  fi

  export DEJAQ_ENRICHER_BACKEND=ollama
  export DEJAQ_NORMALIZER_BACKEND=ollama
  export DEJAQ_LOCAL_LLM_BACKEND=ollama
  export DEJAQ_GENERALIZER_BACKEND=ollama
  export DEJAQ_CONTEXT_ADJUSTER_BACKEND=ollama

  if [[ "$OLLAMA_URL_FLAG_SET" == "true" ]]; then
    export DEJAQ_OLLAMA_URL="$OLLAMA_URL_ARG"
  fi

  if [[ -z "${DEJAQ_OLLAMA_URL:-}" ]]; then
    read -r -p "DEJAQ_OLLAMA_URL: " DEJAQ_OLLAMA_URL
    export DEJAQ_OLLAMA_URL
  fi

  if [[ -z "${DEJAQ_OLLAMA_URL:-}" ]]; then
    echo -e "${RED}DEJAQ_OLLAMA_URL is required for $mode mode.${NC}" >&2
    exit 1
  fi
}

MODE="$(select_mode)"
apply_mode "$MODE"

echo -e "${CYAN}Deployment mode: ${MODE}${NC}"
echo -e "  DEJAQ_ENRICHER_BACKEND=${DEJAQ_ENRICHER_BACKEND}"
echo -e "  DEJAQ_NORMALIZER_BACKEND=${DEJAQ_NORMALIZER_BACKEND}"
echo -e "  DEJAQ_LOCAL_LLM_BACKEND=${DEJAQ_LOCAL_LLM_BACKEND}"
echo -e "  DEJAQ_GENERALIZER_BACKEND=${DEJAQ_GENERALIZER_BACKEND}"
echo -e "  DEJAQ_CONTEXT_ADJUSTER_BACKEND=${DEJAQ_CONTEXT_ADJUSTER_BACKEND}"
if [[ "$MODE" != "in-process" ]]; then
  echo -e "  DEJAQ_OLLAMA_URL=${DEJAQ_OLLAMA_URL}"
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo -e "${GREEN}Dry run complete. Services not started.${NC}"
  exit 0
fi

# ── 1. ChromaDB ─────────────────────────────────────────────────────────────
echo -e "${CYAN}[1/5] Starting ChromaDB server...${NC}"
free_port 8001
"$CHROMA" run --path "$PROJECT_DIR/chroma_data" --host 127.0.0.1 --port 8001 \
  &>"$LOG_DIR/chroma.log" &
CHROMA_PID=$!
sleep 2
if ! kill -0 "$CHROMA_PID" 2>/dev/null; then
  echo -e "${RED}ChromaDB failed to start. Check $LOG_DIR/chroma.log${NC}"; exit 1
fi
echo -e "  ${GREEN}ChromaDB running (PID $CHROMA_PID)${NC}"

# ── 2. Redis ────────────────────────────────────────────────────────────────
echo -e "${CYAN}[2/5] Starting Redis...${NC}"
if ! command -v redis-server &>/dev/null; then
  echo -e "${RED}redis-server not found. Install with: brew install redis${NC}"; exit 1
fi
if redis-cli ping &>/dev/null; then
  echo -e "  ${GREEN}Redis already running — skipping${NC}"
else
  redis-server --daemonize no &>"$LOG_DIR/redis.log" &
  REDIS_PID=$!
  sleep 1
  if ! kill -0 "$REDIS_PID" 2>/dev/null; then
    echo -e "${RED}Redis failed to start. Check $LOG_DIR/redis.log${NC}"; exit 1
  fi
  echo -e "  ${GREEN}Redis running (PID $REDIS_PID)${NC}"
fi

# ── 3. Celery worker ────────────────────────────────────────────────────────
echo -e "${CYAN}[3/5] Starting Celery worker...${NC}"
"$CELERY" -A app.celery_app:celery_app worker \
  --queues=background --pool=solo --loglevel=info \
  &>"$LOG_DIR/celery.log" &
CELERY_PID=$!
sleep 2
if ! kill -0 "$CELERY_PID" 2>/dev/null; then
  echo -e "${RED}Celery worker failed to start. Check $LOG_DIR/celery.log${NC}"; exit 1
fi
echo -e "  ${GREEN}Celery worker running (PID $CELERY_PID)${NC}"

# ── 4. Celery beat ──────────────────────────────────────────────────────────
echo -e "${CYAN}[4/5] Starting Celery beat (periodic tasks)...${NC}"
"$CELERY" -A app.celery_app:celery_app beat \
  --loglevel=info \
  &>"$LOG_DIR/celery_beat.log" &
CELERY_BEAT_PID=$!
sleep 2
if ! kill -0 "$CELERY_BEAT_PID" 2>/dev/null; then
  echo -e "${RED}Celery beat failed to start. Check $LOG_DIR/celery_beat.log${NC}"; exit 1
fi
echo -e "  ${GREEN}Celery beat running (PID $CELERY_BEAT_PID) — eviction runs every 30 min${NC}"

# ── 5. FastAPI ──────────────────────────────────────────────────────────────
echo -e "${CYAN}[5/5] Starting FastAPI...${NC}"
free_port 8000
"$UVICORN" app.main:app --reload &>"$LOG_DIR/uvicorn.log" &
UVICORN_PID=$!
sleep 2
if ! kill -0 "$UVICORN_PID" 2>/dev/null; then
  echo -e "${RED}FastAPI failed to start. Check $LOG_DIR/uvicorn.log${NC}"; exit 1
fi
echo -e "  ${GREEN}FastAPI running (PID $UVICORN_PID)${NC}"

# ── Ready ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}✓ All services running${NC}"
echo -e "  API:         http://127.0.0.1:8000"
echo -e "  ChromaDB:    http://127.0.0.1:8001"
echo -e "  Mode:        $MODE"
echo -e "  Demo UI:     open openai-compat-demo.html in browser"
echo -e "  Stats TUI:   uv run python -m cli.stats"
echo -e "  Logs:        $LOG_DIR/"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services.${NC}\n"

# Tail all logs — kill tail pid in cleanup so it doesn't linger
tail -f "$LOG_DIR/redis.log" "$LOG_DIR/celery.log" "$LOG_DIR/celery_beat.log" "$LOG_DIR/uvicorn.log" &
TAIL_PID=$!
wait $TAIL_PID
