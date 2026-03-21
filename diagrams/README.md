# Diagrams

This folder is the canonical place for architecture images referenced from [Scope.md](../Scope.md).

| File | Purpose |
|------|---------|
| `full_archi.jpg` | Optional high-level system diagram: browsers → Express + JWT + Socket.io → in-memory rooms; WebRTC peer paths. Add this file if you want a visual alongside the Mermaid diagrams in Scope. |
| `flow.jpg` | Optional sequence-style diagram: create room → join → signaling → media → teardown. Add this file to match the live session flow in Scope. |

If these files are absent, the **Mermaid diagrams in [Scope.md](../Scope.md)** are the source of truth for the chosen stack (Express, Socket.io, JWT without DB, WebRTC mesh).
