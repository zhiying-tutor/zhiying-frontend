session := "zhiying-frontend"

serve:
  tmux has-session -t {{session}} 2>/dev/null || tmux new -d -s {{session}} 'pnpm dev'

stop:
  -tmux kill-session -t {{session}}

log:
  tmux attach -t {{session}}

typecheck:
  pnpm exec tsc --noEmit
