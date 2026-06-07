## Mini Project 2 Competency Claim

### C1 - Vibecoding and rapid prototyping

I used a Claude Code + Cursor workflow to rapidly prototype and iterate on MP2, then deployed it through Vercel at [https://mp2-nico2323-projects.vercel.app](https://mp2-nico2323-projects.vercel.app). This was not a one-prompt build: I repeatedly refined interaction flow, report presentation, and session history behavior as I tested each revision in the running app. One thing the tools did well was helping me scaffold a complete component structure quickly; one thing I had to redirect was reliability around model output shape, where I moved from trusting raw output to adding explicit normalization and validation steps.

### C4 - APIs and data acquisition

For MP2, I implemented a server-side API acquisition path in `api/analyze.js` that sends structured screenshot and context payloads to the Anthropic Messages endpoint and returns parsed JSON back to the client. The endpoint response contains evaluation content that my app uses to generate a summary, findings list, and quick wins for the interface under review. I handled secrets with an environment-variable approach (`ANTHROPIC_API_KEY`) so credentials stay server-side and are not committed to client code or version control.

### C7 - Critical evaluation and professional judgment

I treated AI output as a draft to verify, not as final truth, and built checks in `src/lib/api.js` to validate schema, normalize enums, recompute summary counts from findings, and surface warnings when content is inconsistent. A concrete issue I encountered was malformed or mismatched model output (for example, summary totals that did not match findings), which I corrected through repair logic and strict fallback validation before rendering results. I would not present generated recommendations to a client without this verification layer, because unchecked output can look polished while still being structurally or analytically wrong.

### C8 - Building and deploying a complete tool

My MP2 tool is a complete, deployed HCD support app at [https://mp2-nico2323-projects.vercel.app](https://mp2-nico2323-projects.vercel.app) that helps designers and researchers evaluate interface screenshots for usability and accessibility issues in a structured way. It is usable end-to-end: upload, analyze, review severity-ranked findings, and export/share the report, with local history to revisit prior analyses. One issue that went wrong during development was endpoint availability in local environments (for example when `/api/analyze` was not reachable), and I handled it by adding explicit error messaging and fallback behavior so the workflow stayed understandable. If I scoped a next version, I would add stronger endpoint hardening and automated tests for normalization logic earlier in the project.