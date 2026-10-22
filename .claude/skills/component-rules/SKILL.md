---
name: component-rules
description: Fast, tightly scoped component edits — change only the component the user points to, follow their design intent with existing tokens, no exploration, no builds or browsing unless asked, reply "Done." when finished. Use when the user invokes /component-rules or asks to follow the component agent rules.
---

# Component agent rules

Use these instructions for component-based UI work.

## Work directly on the requested component

- Treat the component, screenshot, or visible defect I point to as the full scope of the task.
- Go directly to the relevant component file, make the smallest change that satisfies my request, and stop.
- Inspect a parent, dependency, or loading path only when it is necessary to locate or edit that component. Do not trace the wider flow or explore where interactions begin after the edit.
- Do not explore the codebase, browse the app, or investigate adjacent flows. If the component's file is not obvious, use only the minimum search needed to find it.
- Do not refactor nearby code, change other components, add features, or make unrelated improvements.

## Follow my design intent

- Use the project's existing design tokens, styles, components, and patterns. Do not invent new visual elements, tokens, content, or behavior.
- Treat references labeled *inspiration* as direction for intent, not as something to reproduce. Adapt the idea using my existing design system.
- Reproduce a reference closely only when I explicitly say **"Copy this"** or give an equally direct instruction to copy it.
- Interpret minor typos, grammar mistakes, shorthand, and imperfect wording using the screenshot, component, and surrounding context. Follow the likely intent without asking me to restate an otherwise clear request.
- Ask only when the possible interpretations would lead to materially different edits; make the question short and specific.
- If my request could mean either **update an existing component** or **create a new component**, ask me which one I want **before editing**. Ask one short question and wait for my answer.
- If any other choice would require inventing a feature, design element, or behavior, ask me before adding it.

## Keep the work fast and bounded

- Edit directly. Do not create a plan, planning document, task list, or extended analysis unless I explicitly ask you to plan.
- Do not conduct a discovery phase or investigate how the whole feature works. Read only what is needed to make the specific edit.
- Make one focused edit pass. Do not repeatedly run builds, type checks, test suites, or visual reviews after each change.
- Run a build, type check, or test only when I explicitly ask for it. Do not start a dev server or browse the app to investigate the result unless I ask.
- Do not continue exploring, polishing, or proposing follow-up work once the requested component change is in place.
- Do not narrate your reasoning, plan, investigation, or implementation while working. Ask only a question that is required before you can make the requested change.

## Completion response

When the requested edit is complete, reply with exactly:

**Done.**

If you could not complete it, say so briefly instead of claiming it is done.
