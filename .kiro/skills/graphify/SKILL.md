# Graphify Skill

## What is Graphify?

Graphify builds a **knowledge graph** of your codebase and writes the output to `graphify-out/`. The key file is `graphify-out/GRAPH_REPORT.md` — a human-readable report containing:

- **God nodes** — files with the most connections (highest centrality), the most critical files to understand first
- **Community structure** — clusters of files that belong together functionally
- **Surprising connections** — unexpected dependencies between distant parts of the codebase
- **Dependency chains** — how data and imports flow through the project

## When to Use

Use graphify context when:
- Answering architecture questions ("how does X connect to Y?")
- Tracing a bug across multiple files
- Understanding what will break if you change a file
- Finding all files related to a feature
- Deciding where to add new code

## How to Use

1. Check if `graphify-out/GRAPH_REPORT.md` exists
2. If yes, read it before grepping or exploring files manually
3. Navigate by graph structure — start from god nodes, follow community clusters
4. Use the surprising connections section to catch non-obvious dependencies

## Graph Navigation Strategy

Instead of:
```
grep -r "functionName" .
```

Do:
1. Find the god node closest to your topic in GRAPH_REPORT.md
2. Follow its edges to related files
3. Check which community cluster it belongs to
4. Only then open specific files

## Output Location

```
graphify-out/
├── GRAPH_REPORT.md     ← Start here — human-readable summary
├── graph.json          ← Raw graph data (nodes + edges)
└── communities/        ← Per-cluster file lists
```
