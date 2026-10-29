---
description: Compact current active session memory into a permanent titled summary and prepare the next sequence.
---

# End Session (Memory Compaction)

Follow the workflow below to compact the current active memory log into a finalized session summary:

1. **Locate Current Active Memory File:**
   - Identify the active uncompacted memory log: `docs/memory/MM-DD-YY-SEQUENCE.md` (e.g., `docs/memory/08-25-26-1.md`).

2. **Synthesize Prompts & Changes:**
   - Read all `## Prompt [N]` entries in the active sequence file.
   - Consolidate goals, technical decisions, architectural patterns, and deduplicate the list of created, modified, and deleted files.

3. **Determine Title/Topic:**
   - Formulate a clear, descriptive kebab-case title/topic that describes the main accomplishments of the session (e.g., `architecture-and-standards-init`).

4. **Create Compacted Memory File:**
   - Target location: `docs/memory/MM-DD-YY-SEQUENCE-TITLE.md` (e.g., `docs/memory/08-25-26-1-architecture-and-standards-init.md`).
   - Format:
     ```markdown
     # Session Summary: [Title]
     **Date:** MM-DD-YY
     **Sequence:** [Sequence Number]
     **Topic:** [Topic / Key Feature Area]

     ## Executive Summary
     [Concise overview of what was built or decided during this session]

     ## Key Architectural & Technical Decisions
     * **[Area 1]:** [Rationale and decisions]
     * **[Area 2]:** [Rationale and decisions]

     ## Cumulative File Changes
     * (new) - path/to/file.ts - Description
     * (modified) - path/to/file.tsx - Description
     * (deleted) - path/to/file.ts - Description
     * (new - lib) - package-name - Why added
     ```

5. **Finalize Sequence:**
   - Replace or clean up the active raw `MM-DD-YY-SEQUENCE.md` file with the compacted `MM-DD-YY-SEQUENCE-TITLE.md`.
   - The subsequent working session will increment the sequence number: `MM-DD-YY-(SEQUENCE+1).md`.