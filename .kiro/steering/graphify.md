---
inclusion: always
---

# Graphify — Codebase Knowledge Graph

A knowledge graph of this project lives in `graphify-out/`. If `graphify-out/GRAPH_REPORT.md` exists, read it before answering architecture questions, tracing dependencies, or searching files — it contains god nodes, community structure, and surprising connections the graph found.

**Navigate by graph structure instead of grepping raw files.**

- Start from `graphify-out/GRAPH_REPORT.md` for any cross-file investigation
- God nodes = highest-centrality files = most important to understand first
- Community clusters = files that belong together functionally
- Surprising connections = non-obvious dependencies worth checking before making changes
