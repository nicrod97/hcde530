## Mini Project 2 Competency Claim

### C1 - Vibecoding and rapid prototyping

I used a Claude Code + Cursor workflow to rapidly prototype and iterate on MP2, then deployed it through Vercel at [https://mp2-nico2323-projects.vercel.app](https://mp2-nico2323-projects.vercel.app). This was not a one-prompt build: I repeatedly refined how results are presented so users first get a guided walkthrough (overview -> finding lessons -> recap) before choosing the full report. One thing the tools did well was helping me scaffold and connect this multi-step flow quickly; one thing I had to redirect was balancing clarity and control, so I added an explicit “Browse full report” path for users who prefer direct kanban inspection.

### C4 - APIs and data acquisition

For MP2, I implemented a serverless API route in `api/analyze.js` that sends structured screenshot and context payloads to the Anthropic Messages endpoint and returns parsed JSON to the client. That response powers both result modes: the guided lesson-style walkthrough and the optional full report with kanban grouping and filters. I handled secrets with an environment-variable approach (`ANTHROPIC_API_KEY`) so credentials stay server-side and are not committed to client code or version control.

### C7 - Critical evaluation and professional judgment

I treated AI output as a draft to verify, not as final truth, and built checks in `src/lib/api.js` to validate schema, normalize enums, recompute summary counts from findings, and surface warnings when content is inconsistent. A concrete issue I encountered was mismatched output structure (for example, summary totals that did not match findings), which I corrected through repair logic and strict fallback validation before showing results. I also made a presentation judgment: guided review is the default because it reduces misinterpretation risk for learners, while full kanban browsing remains available for users who want complete direct inspection.

### C8 - Building and deploying a complete tool

My MP2 tool is a complete, deployed HCD support app at [https://mp2-nico2323-projects.vercel.app](https://mp2-nico2323-projects.vercel.app) that helps designers and researchers evaluate interface screenshots for usability and accessibility issues. The main results experience is a guided walkthrough that teaches users how to interpret findings step by step, then offers an optional full report (including kanban grouping) for users who want exhaustive detail. One issue that went wrong during development was endpoint availability in local environments (for example when `/api/analyze` was not reachable), and I handled it with explicit error messaging and fallback behavior so users still understood what happened. If I scoped a next version, I would add stronger endpoint hardening and automated tests for normalization logic earlier in the project.