#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CRM  ·  Development Launcher  ·  PM2-style live dashboard
#  Press Ctrl+C to stop all services cleanly.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
LAUNCH_TIME=$(date +%s)

BACKEND_PID=""   FRONTEND_PID=""
BACKEND_ST=$LAUNCH_TIME   FRONTEND_ST=$LAUNCH_TIME
BACKEND_RC=0     FRONTEND_RC=0
_FC=0  _FL=0   # cached frame cols/lines — redrawn when these change

# ── Colours ──────────────────────────────────────────────────────────────────
NC='\033[0m'  BD='\033[1m'  DM='\033[2m'
R='\033[31m'  RB='\033[1;31m'
G='\033[32m'  GB='\033[1;32m'
Y='\033[33m'  YB='\033[1;33m'
B='\033[34m'  BB='\033[1;34m'
P='\033[35m'  PB='\033[1;35m'   # purple/magenta
T='\033[36m'  TB='\033[1;36m'   # teal/cyan
W='\033[37m'  WB='\033[1;37m'

# Border colour — single variable so it's easy to change
BDR="${TB}"

# ── Primitives ────────────────────────────────────────────────────────────────
at()    { printf '\033[%d;%dH' "$1" "$2"; }   # move cursor
eol()   { printf '\033[K'; }                   # erase to end of line
rep()   { printf '%*s' "$2" '' | tr ' ' "$1"; }
hide_cursor() { printf '\033[?25l'; }
show_cursor() { printf '\033[?25h'; }
strip_ansi()  { sed 's/\033\[[0-9;]*[mKHJfsu]//g; s/\033(B//g'; }
pad_right()   { printf '%-*s' "$1" "$2"; }     # left-align in N chars (no colour)

# Print a full-width bordered row.
# Usage: wrow ROW COLS "content_string_with_color_codes"
# Content is printed, then EOL is erased, then right border is placed at col COLS.
wrow() {
    at "$1" 1
    printf "${BDR}${BD}║${NC} %b" "$3"
    eol
    at "$1" "$2"
    printf "${BDR}${BD}║${NC}"
}

# ── Helpers ───────────────────────────────────────────────────────────────────
pid_alive()  { [[ -n "${1:-}" ]] && kill -0 "$1" 2>/dev/null; }
lcount()     { grep -cE "$2" "$1" 2>/dev/null || echo 0; }
to_int()     { printf '%s' "${1:-0}" | tr -cd '0-9'; }

proc_mem() {
    local pid="${1:-}"; [[ -z "$pid" ]] && echo "—" && return
    local kb; kb=$(awk '/^VmRSS/{print $2}' "/proc/$pid/status" 2>/dev/null) || { echo "—"; return; }
    [[ -z "$kb" ]] && echo "—" && return
    awk "BEGIN{printf \"%.1f MB\", $kb/1024}"
}

uptime_fmt() {
    local s=$(( $(date +%s) - ${1:-$LAUNCH_TIME} ))
    local h=$(( s/3600 )) m=$(( (s%3600)/60 )) ss=$(( s%60 ))
    (( h > 0 )) && printf '%dh %02dm' "$h" "$m" && return
    (( m > 0 )) && printf '%dm %02ds' "$m" "$ss" && return
    printf '%ds' "$ss"
}

# CPU% sampled between ticks via /proc/<pid>/stat
declare -A _CPU_T=() _CPU_N=()
cpu_pct() {
    local pid="${1:-}"; [[ -z "$pid" ]] && echo "—%" && return
    [[ ! -f "/proc/$pid/stat" ]] && echo "—%" && return
    local f; read -ra f < "/proc/$pid/stat" 2>/dev/null || { echo "—%"; return; }
    local ct=$(( ${f[13]:-0} + ${f[14]:-0} ))
    local cn; cn=$(date +%s%N 2>/dev/null) || cn=$(( $(date +%s) * 1000000000 ))
    local pt=${_CPU_T[$pid]:-0} pn=${_CPU_N[$pid]:-$cn}
    _CPU_T[$pid]=$ct; _CPU_N[$pid]=$cn
    local dt=$(( (cn - pn) / 1000000 ))
    (( dt < 200 )) && echo "—%" && return
    awk "BEGIN{printf \"%.1f%%\", (($ct-$pt)/100)/($dt/1000)*100}"
}

# ── Cleanup ───────────────────────────────────────────────────────────────────
cleanup() {
    show_cursor; tput rmcup 2>/dev/null || true
    printf '\n'
    echo -e "${YB}  Shutting down CRM services…${NC}"
    local pids=()
    pid_alive "${BACKEND_PID:-}"  && pids+=("$BACKEND_PID")
    pid_alive "${FRONTEND_PID:-}" && pids+=("$FRONTEND_PID")
    for p in "${pids[@]:-}"; do kill -TERM "$p" 2>/dev/null || true; done
    local i=0
    while (( i < 40 )); do
        local alive=0
        for p in "${pids[@]:-}"; do pid_alive "$p" && alive=1 && break; done
        (( alive == 0 )) && break
        sleep 0.1; i=$(( i + 1 ))
    done
    for p in "${pids[@]:-}"; do pid_alive "$p" && kill -KILL "$p" 2>/dev/null || true; done
    { lsof -ti:3000 | xargs kill -9; } 2>/dev/null || true
    { lsof -ti:8080 | xargs kill -9; } 2>/dev/null || true
    echo -e "${GB}  ✔  All services stopped${NC}\n"
    exit 0
}
trap cleanup SIGINT SIGTERM

# ── Pre-flight ─────────────────────────────────────────────────────────────────
preflight() {
    local ok=1
    echo -e "  ${TB}${BD}Pre-flight checks${NC}"
    echo -e "  ${DM}$(rep '─' 44)${NC}"
    command -v node &>/dev/null \
        && echo -e "  ${GB}✔${NC}  Node.js  ${DM}$(node --version)${NC}" \
        || { echo -e "  ${RB}✘${NC}  Node.js not found — install Node 18+"; ok=0; }
    command -v npm &>/dev/null \
        && echo -e "  ${GB}✔${NC}  npm      ${DM}$(npm --version)${NC}" \
        || { echo -e "  ${RB}✘${NC}  npm not found"; ok=0; }
    if [[ -d "$SCRIPT_DIR/backend/node_modules" ]]; then
        echo -e "  ${GB}✔${NC}  backend/node_modules"
    else
        echo -e "  ${YB}⚠${NC}  Installing backend dependencies…"
        (cd "$SCRIPT_DIR/backend"  && npm install --silent) \
            && echo -e "  ${GB}✔${NC}  Done" || { ok=0; echo -e "  ${RB}✘${NC}  Failed"; }
    fi
    if [[ -d "$SCRIPT_DIR/frontend/node_modules" ]]; then
        echo -e "  ${GB}✔${NC}  frontend/node_modules"
    else
        echo -e "  ${YB}⚠${NC}  Installing frontend dependencies…"
        (cd "$SCRIPT_DIR/frontend" && npm install --silent) \
            && echo -e "  ${GB}✔${NC}  Done" || { ok=0; echo -e "  ${RB}✘${NC}  Failed"; }
    fi
    [[ -f "$SCRIPT_DIR/backend/.env" ]] \
        && echo -e "  ${GB}✔${NC}  backend/.env" \
        || echo -e "  ${YB}⚠${NC}  backend/.env not found"
    echo ""; return $(( 1 - ok ))
}

# ── Boot services ──────────────────────────────────────────────────────────────
boot() {
    mkdir -p "$LOG_DIR"
    echo -e "  ${YB}Clearing ports 3000 & 8080…${NC}"
    { lsof -ti:3000 | xargs kill -9; } 2>/dev/null || true
    { lsof -ti:8080 | xargs kill -9; } 2>/dev/null || true
    sleep 0.3

    echo -e "  ${BB}${BD}▶  Backend${NC}  ${DM}npm run dev${NC}"
    : > "$LOG_DIR/backend.log"
    (cd "$SCRIPT_DIR/backend"  && npm run dev >> "$LOG_DIR/backend.log" 2>&1) &
    BACKEND_PID=$!; BACKEND_ST=$(date +%s)
    echo -ne "  ${DM}Waiting"
    local i=0
    while (( i < 80 )); do
        grep -qiE 'listen|ready|started|:3000' "$LOG_DIR/backend.log" 2>/dev/null && break
        printf '.'; sleep 0.1; i=$(( i+1 ))
    done
    echo -e "${NC}  ${GB}ready${NC}  ${DM}PID $BACKEND_PID${NC}"

    echo -e "  ${PB}${BD}▶  Frontend${NC}  ${DM}npm run dev${NC}"
    : > "$LOG_DIR/frontend.log"
    (cd "$SCRIPT_DIR/frontend" && npm run dev >> "$LOG_DIR/frontend.log" 2>&1) &
    FRONTEND_PID=$!; FRONTEND_ST=$(date +%s)
    echo -ne "  ${DM}Waiting"
    i=0
    while (( i < 120 )); do
        grep -qiE 'Local:|ready in|vite' "$LOG_DIR/frontend.log" 2>/dev/null && break
        printf '.'; sleep 0.1; i=$(( i+1 ))
    done
    echo -e "${NC}  ${PB}ready${NC}  ${DM}PID $FRONTEND_PID${NC}"
    echo ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DASHBOARD  —  layout (1-based row numbers)
#
#   1   ╔═══════════════════════════════════════════════════════╗
#   2   ║  ◈  CRM DEVELOPMENT  ◈  timestamp  ·  uptime          ║  dynamic
#   3   ╠═══════════════════════════════════════════════════════╣
#   4   ║  SYSTEM  load  ·  mem  ·  status                      ║  dynamic
#   5   ╠═══════════════════════════════════════════════════════╣
#   6   ║  ┌──────────────────── PM2 TABLE ──────────────────┐  ║  static
#   7   ║  │  id   name       status      pid    uptime  …   │  ║  static
#   8   ║  ├──────────────────────────────────────────────── ┤  ║  static
#   9   ║  │   0   backend    ● online   49007   2m 34s  …   │  ║  dynamic
#  10   ║  │   1   frontend   ● online   49021   2m 34s  …   │  ║  dynamic
#  11   ║  └─────────────────────────────────────────────────┘  ║  static
#  12   ╠═══════════════════════════════════════════════════════╣
#  13   ║  METRICS  backend: req/err/warn  │  frontend: err/hmr  ║  dynamic
#  14   ╠═══════════════════╦═══════════════════════════════════╣
#  15   ║  BACKEND  :3000   ║  FRONTEND  :8080                  ║  static
#  16   ╠═══════════════════╬═══════════════════════════════════╣
#  17+  ║  log lines        ║  log lines                        ║  dynamic
#  N-1  ╚═══════════════════╩═══════════════════════════════════╝
#  N    footer                                                     dynamic
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# PM2 inner table: column widths (visible chars, excluding │ separators)
# id name status pid uptime cpu memory restarts port errors
TW=(2 10 9 7 8 6 10 6 6 6)   # column widths
TH=(" id" " name      " " status   " "    pid " " uptime " "  cpu " "    memory " " restarts" " port " " errors")

# Build a table separator line from widths: "├──┼──┤"
tbl_sep() {
    local left="$1" mid="$2" right="$3"
    printf "%s" "$left"
    local sep=""
    for w in "${TW[@]}"; do
        [[ -n "$sep" ]] && printf "%s" "$mid"
        printf '%s' "$(rep '─' $(( w + 2 )))"
        sep="x"
    done
    printf "%s" "$right"
}

# Draw the static frame — only on first render or terminal resize
draw_frame() {
    local C=$1 L=$2
    local LW=$(( (C - 3) / 2 ))   # left log pane inner width
    local RW=$(( C - LW - 3 ))    # right log pane inner width
    local LOG_ROWS=$(( L - 17 ))
    (( LOG_ROWS < 2 )) && LOG_ROWS=2

    tput clear

    local FULL="$(rep '═' $(( C - 2 )))"

    # ── Row 1-2: Title ──────────────────────────────────────────────────────
    at 1 1; printf "${BDR}${BD}╔%s╗${NC}" "$FULL"
    at 2 1; printf "${BDR}${BD}║${NC}"; eol; at 2 "$C"; printf "${BDR}${BD}║${NC}"

    # ── Row 3-4: System info ──────────────────────────────────────────────
    at 3 1; printf "${BDR}${BD}╠%s╣${NC}" "$FULL"
    at 4 1; printf "${BDR}${BD}║${NC}"; eol; at 4 "$C"; printf "${BDR}${BD}║${NC}"

    # ── Row 5: separator ─────────────────────────────────────────────────
    at 5 1; printf "${BDR}${BD}╠%s╣${NC}" "$FULL"

    # ── Rows 6-11: PM2 table (static parts) ──────────────────────────────
    at 6 1
    printf "${BDR}${BD}║${NC}  "
    printf "${DM}%s${NC}" "$(tbl_sep '┌' '┬' '┐')"
    eol; at 6 "$C"; printf "${BDR}${BD}║${NC}"

    at 7 1
    printf "${BDR}${BD}║${NC}  ${DM}│"
    for i in "${!TH[@]}"; do
        printf " ${WB}%-*s${NC}${DM} │" "${TW[$i]}" "${TH[$i]}"
    done
    eol; at 7 "$C"; printf "${BDR}${BD}║${NC}"

    at 8 1
    printf "${BDR}${BD}║${NC}  "
    printf "${DM}%s${NC}" "$(tbl_sep '├' '┼' '┤')"
    eol; at 8 "$C"; printf "${BDR}${BD}║${NC}"

    # Rows 9-10: process rows — dynamic (blank placeholders)
    for r in 9 10; do
        at $r 1; printf "${BDR}${BD}║${NC}"; eol; at $r "$C"; printf "${BDR}${BD}║${NC}"
    done

    at 11 1
    printf "${BDR}${BD}║${NC}  "
    printf "${DM}%s${NC}" "$(tbl_sep '└' '┴' '┘')"
    eol; at 11 "$C"; printf "${BDR}${BD}║${NC}"

    # ── Row 12: separator ────────────────────────────────────────────────
    at 12 1; printf "${BDR}${BD}╠%s╣${NC}" "$FULL"

    # ── Row 13: Metrics — dynamic placeholder ──────────────────────────
    at 13 1; printf "${BDR}${BD}║${NC}"; eol; at 13 "$C"; printf "${BDR}${BD}║${NC}"

    # ── Row 14: log pane split header ────────────────────────────────────
    at 14 1
    printf "${BDR}${BD}╠%s╦%s╣${NC}" \
        "$(rep '═' $(( LW + 1 )))" \
        "$(rep '═' $(( RW + 1 )))"

    # ── Row 15: pane labels ──────────────────────────────────────────────
    at 15 1
    printf "${BDR}${BD}║${NC} ${BB}${BD}◎  BACKEND   ·  http://localhost:3000${NC}"
    eol; at 15 $(( LW + 2 )); printf "${BDR}${BD}║${NC}"
    printf " ${PB}${BD}◎  FRONTEND  ·  http://localhost:8080${NC}"
    eol; at 15 "$C"; printf "${BDR}${BD}║${NC}"

    # ── Row 16: under pane labels ────────────────────────────────────────
    at 16 1
    printf "${BDR}${BD}╠%s╬%s╣${NC}" \
        "$(rep '─' $(( LW + 1 )))" \
        "$(rep '─' $(( RW + 1 )))"

    # ── Bottom border ─────────────────────────────────────────────────────
    at $(( 17 + LOG_ROWS )) 1
    printf "${BDR}${BD}╚%s╩%s╝${NC}" \
        "$(rep '═' $(( LW + 1 )))" \
        "$(rep '═' $(( RW + 1 )))"
}

# Draw all dynamic content — runs every tick
draw_dynamic() {
    local C=$1 L=$2
    local LW=$(( (C - 3) / 2 ))
    local RW=$(( C - LW - 3 ))
    local LOG_ROWS=$(( L - 17 ))
    (( LOG_ROWS < 2 )) && LOG_ROWS=2

    # ── Row 2: Title bar ─────────────────────────────────────────────────
    local ts; ts=$(date '+%a  %d %b %Y    %H:%M:%S')
    local up; up=$(uptime_fmt "$LAUNCH_TIME")
    wrow 2 "$C" "${BD}  ◈  CRM DEVELOPMENT  ◈${NC}   ${DM}${ts}${NC}   uptime ${WB}${up}${NC}"

    # ── Row 4: System info ────────────────────────────────────────────────
    local load; load=$(cut -d' ' -f1 /proc/loadavg 2>/dev/null || echo '?')
    local mt ma
    mt=$(awk '/^MemTotal/{print $2}'     /proc/meminfo 2>/dev/null || echo 0)
    ma=$(awk '/^MemAvailable/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
    local mem_pct mem_gb mem_str
    if (( mt > 0 )); then
        mem_pct=$(awk "BEGIN{printf \"%.0f\", (($mt-$ma)/$mt)*100}")
        mem_gb=$(awk  "BEGIN{printf \"%.1f\", $mt/1048576}")
        mem_str="${mem_pct}% of ${mem_gb} GB"
    else
        mem_str="?"
    fi
    local online=0
    pid_alive "${BACKEND_PID:-}"  && online=$(( online + 1 )) || true
    pid_alive "${FRONTEND_PID:-}" && online=$(( online + 1 )) || true
    local st_col="${GB}"; (( online < 2 )) && st_col="${YB}"
    wrow 4 "$C" \
        "${DM}SYSTEM${NC}   load ${WB}${load}${NC}   memory ${WB}${mem_str}${NC}   ${st_col}${BD}● ${online}/2 online${NC}"

    # ── Rows 9-10: Process table rows ────────────────────────────────────
    local NAMES=(backend frontend)
    local PIDS=("${BACKEND_PID:-}" "${FRONTEND_PID:-}")
    local PORTS=(":3000" ":8080")
    local STIMES=("$BACKEND_ST" "$FRONTEND_ST")
    local RCNTS=("$BACKEND_RC" "$FRONTEND_RC")
    local LOGS=("$LOG_DIR/backend.log" "$LOG_DIR/frontend.log")
    local NCOL=("${BB}${BD}" "${PB}${BD}")

    for idx in 0 1; do
        local row=$(( 9 + idx ))
        local pid="${PIDS[$idx]:-}"
        local logf="${LOGS[$idx]}"
        local ncol="${NCOL[$idx]}"

        local st_text st_col cpu_s mem_s up_s err_s rc_s pid_s
        if pid_alive "$pid"; then
            st_text="● online"
            st_col="${GB}"
            cpu_s=$(cpu_pct  "$pid")
            mem_s=$(proc_mem "$pid")
            up_s=$(uptime_fmt "${STIMES[$idx]}")
            err_s=$(lcount "$logf" 'error|ERROR')
        else
            st_text="✕ stopped"
            st_col="${RB}"
            cpu_s="—%"; mem_s="—"; up_s="—"; err_s="—"
        fi
        pid_s="$pid"
        rc_s="${RCNTS[$idx]}"

        at $row 1
        printf "${BDR}${BD}║${NC}  ${DM}│${NC}"
        printf " ${BD}%*s${NC}"     "${TW[0]}" "$idx"
        printf " ${DM}│${NC} ${ncol}%-*s${NC}" "${TW[1]}" "${NAMES[$idx]}"
        printf " ${DM}│${NC} ${st_col}%-*s${NC}" "${TW[2]}" "$st_text"
        printf " ${DM}│${NC} ${DM}%*s${NC}"    "${TW[3]}" "$pid_s"
        printf " ${DM}│${NC} ${WB}%-*s${NC}"   "${TW[4]}" "$up_s"
        printf " ${DM}│${NC} ${TB}%*s${NC}"    "${TW[5]}" "$cpu_s"
        printf " ${DM}│${NC} ${PB}%*s${NC}"    "${TW[6]}" "$mem_s"
        printf " ${DM}│${NC} ${DM}%*s${NC}"    "${TW[7]}" "$rc_s"
        printf " ${DM}│${NC} ${BB}%-*s${NC}"   "${TW[8]}" "${PORTS[$idx]}"
        if [[ "$err_s" == "0" || "$err_s" == "—" ]]; then
            printf " ${DM}│${NC} ${DM}%*s${NC}" "${TW[9]}" "$err_s"
        else
            printf " ${DM}│${NC} ${RB}${BD}%*s${NC}" "${TW[9]}" "$err_s"
        fi
        printf " ${DM}│${NC}"
        eol; at $row "$C"; printf "${BDR}${BD}║${NC}"
    done

    # ── Row 13: Metrics bar ───────────────────────────────────────────────
    local b_req b_err b_warn f_err f_warn f_hmr
    b_req=$(lcount  "$LOG_DIR/backend.log"  'GET |POST |PUT |DELETE |PATCH ')
    b_err=$(lcount  "$LOG_DIR/backend.log"  'error|ERROR')
    b_warn=$(lcount "$LOG_DIR/backend.log"  'warn|WARN')
    f_err=$(lcount  "$LOG_DIR/frontend.log" 'error|ERROR')
    f_warn=$(lcount "$LOG_DIR/frontend.log" 'warn|WARN')
    f_hmr=$(lcount  "$LOG_DIR/frontend.log" 'hmr|hot update|page reload|HMR')

    b_req=$(to_int "$b_req");   b_req=${b_req:-0}
    b_err=$(to_int "$b_err");   b_err=${b_err:-0}
    b_warn=$(to_int "$b_warn"); b_warn=${b_warn:-0}
    f_err=$(to_int "$f_err");   f_err=${f_err:-0}
    f_warn=$(to_int "$f_warn"); f_warn=${f_warn:-0}
    f_hmr=$(to_int "$f_hmr");   f_hmr=${f_hmr:-0}

    local b_err_col="${DM}"; (( b_err  > 0 )) && b_err_col="${RB}${BD}"
    local b_warn_col="${DM}"; (( b_warn > 0 )) && b_warn_col="${YB}"
    local f_err_col="${DM}";  (( f_err  > 0 )) && f_err_col="${RB}${BD}"
    local f_warn_col="${DM}"; (( f_warn > 0 )) && f_warn_col="${YB}"

    wrow 13 "$C" \
        "${BB}${BD}BACKEND${NC}  req ${WB}${b_req}${NC}  err ${b_err_col}${b_err}${NC}  warn ${b_warn_col}${b_warn}${NC}    ${DM}│${NC}    ${PB}${BD}FRONTEND${NC}  err ${f_err_col}${f_err}${NC}  warn ${f_warn_col}${f_warn}${NC}  hmr ${TB}${f_hmr}${NC}"

    # ── Log panes (rows 17 … 16+LOG_ROWS) ────────────────────────────────
    local b_arr=() f_arr=()
    mapfile -t b_arr < <(tail -n "$LOG_ROWS" "$LOG_DIR/backend.log"  2>/dev/null | strip_ansi)
    mapfile -t f_arr < <(tail -n "$LOG_ROWS" "$LOG_DIR/frontend.log" 2>/dev/null | strip_ansi)

    local pw=$(( LW - 1 ))   # usable width per log line (inside the ║ borders)
    local fw=$(( RW - 1 ))

    for (( i = 0; i < LOG_ROWS; i++ )); do
        at $(( 17 + i )) 1
        local bl="${b_arr[$i]:-}" fl="${f_arr[$i]:-}"

        # Backend line colour
        local bc="${DM}"
        [[ "$bl" =~ [Ee][Rr][Rr][Oo][Rr] ]]                           && bc="${R}"  || true
        [[ "$bl" =~ [Ww][Aa][Rr][Nn]      ]]                           && bc="${Y}"  || true
        [[ "$bl" =~ listen|ready|started   ]]                           && bc="${GB}" || true
        [[ "$bl" =~ (GET|POST|PUT|DELETE|PATCH)[[:space:]] ]]           && bc="${T}"  || true
        [[ "$bl" =~ prisma|query           ]]                           && bc="${B}"  || true

        # Frontend line colour
        local fc="${DM}"
        [[ "$fl" =~ [Ee][Rr][Rr][Oo][Rr]            ]]                 && fc="${R}"  || true
        [[ "$fl" =~ [Ww][Aa][Rr][Nn]                ]]                 && fc="${Y}"  || true
        [[ "$fl" =~ ready\ in|Local:                 ]]                 && fc="${GB}" || true
        [[ "$fl" =~ hmr|hot\ update|page\ reload|HMR ]]                 && fc="${T}"  || true
        [[ "$fl" =~ vite|"➜"                         ]]                 && fc="${P}"  || true

        printf "${BDR}${BD}║${NC}${bc}%-*.*s${NC}" $pw $pw "$bl"
        printf "${BDR}${BD}║${NC}${fc}%-*.*s${NC}" $fw $fw "$fl"
        printf "${BDR}${BD}║${NC}"
    done

    # ── Footer ────────────────────────────────────────────────────────────
    at "$L" 1
    printf "${DM}  Ctrl+C to stop  ·  auto-restart on crash  ·  logs: %s${NC}" "$LOG_DIR"
    eol
}

# ── Dashboard loop ─────────────────────────────────────────────────────────────
dashboard() {
    hide_cursor
    while true; do
        local C L; C=$(tput cols); L=$(tput lines)

        # Redraw static frame only when terminal size changes
        if [[ "$C" != "$_FC" || "$L" != "$_FL" ]]; then
            draw_frame "$C" "$L"
            _FC=$C; _FL=$L
        fi

        draw_dynamic "$C" "$L"

        # Auto-restart crashed services
        if ! pid_alive "${BACKEND_PID:-}"; then
            at $(( L - 1 )) 1
            printf "${YB}  ↺  Backend crashed — restarting…${NC}"; eol
            : > "$LOG_DIR/backend.log"
            (cd "$SCRIPT_DIR/backend"  && npm run dev >> "$LOG_DIR/backend.log" 2>&1) &
            BACKEND_PID=$!; BACKEND_ST=$(date +%s); BACKEND_RC=$(( BACKEND_RC + 1 ))
            _FC=0   # force frame redraw (new PID in table)
        fi
        if ! pid_alive "${FRONTEND_PID:-}"; then
            at $(( L - 1 )) 1
            printf "${YB}  ↺  Frontend crashed — restarting…${NC}"; eol
            : > "$LOG_DIR/frontend.log"
            (cd "$SCRIPT_DIR/frontend" && npm run dev >> "$LOG_DIR/frontend.log" 2>&1) &
            FRONTEND_PID=$!; FRONTEND_ST=$(date +%s); FRONTEND_RC=$(( FRONTEND_RC + 1 ))
            _FC=0
        fi

        sleep 1
    done
}

# ── Entry point ────────────────────────────────────────────────────────────────
main() {
    cd "$SCRIPT_DIR"
    mkdir -p "$LOG_DIR"

    # Alternate screen — clean slate, no bleed from previous runs
    tput smcup 2>/dev/null || true
    tput clear

    # Banner
    local C; C=$(tput cols)
    printf '\n'
    printf "${TB}${BD}%s${NC}\n" "$(rep '━' "$C")"
    printf "${TB}${BD}  %-*s${NC}\n" $(( C - 3 )) "◈  CRM DEVELOPMENT ENVIRONMENT  ◈  LIVE MONITOR"
    printf "${TB}${BD}%s${NC}\n\n" "$(rep '━' "$C")"

    preflight || {
        echo -e "\n${RB}  Pre-flight failed. Press Enter to exit.${NC}"
        read -r; tput rmcup 2>/dev/null || true; exit 1
    }

    boot

    echo -e "${GB}${BD}  ✔  Both services running.  Launching dashboard…${NC}\n"
    sleep 0.8

    dashboard
}

main "$@"
