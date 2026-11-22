# Tiny Stack VM

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/wompkun/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack virtual machine for make.fun's ISA: 32-bit wrapping arithmetic, a 256-value stack, calls, 256 words of memory, input/output and all ten traps.

## How to run

```sh
mkdir -p out && MAKEFUN_INPUT_DIR=<input> MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node 22, standard library only, no network. Answers all 40 instances in one run.
