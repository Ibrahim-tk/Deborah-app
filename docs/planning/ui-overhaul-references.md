# UI overhaul — annotated research and reference catalogue

**Research date:** 17 October 2026 · **Scope:** interaction and presentation references for the mobile Oracle Clinician prototype.

This catalogue uses official product documentation, vendor demonstrations, publisher App Store listings, and standards documentation. Product references establish documented patterns; the Oracle applications below are design proposals. Marketing examples and older announcements are not proof of the exact layout in every current native-app account. No signed-in competitor account was used, and no private Oracle data was submitted to a reference app.

## Evidence labels

- **D — documented:** supported by an opened official source.
- **H — historical:** a dated announcement useful for explaining a pattern’s origin.
- **V — visual reference destination:** a public page with product imagery or publisher screenshots to inspect during design review; not a pixel specification or a claim of measured native behavior.
- **P — proposal:** our adaptation, subject to the existing app’s data and behavior contracts.

## Grok

### R01 — Conversation as the primary starting point · D/V

[Grok official product overview](https://x.ai/grok)

The page presents chat, follow-up conversation, and additional capabilities through a common assistant experience. **Study:** the prominence of the immediate conversational task relative to secondary features. **Oracle proposal:** one clear continuation card after the fixed greeting. The existing launcher remains the entry point for a new question. Do not import Grok modes, model selectors, imagery tools, public sharing, or its visual brand.

### R02 — Native mobile reference set · V

[Grok AI — publisher App Store listing](https://apps.apple.com/us/app/grok-ai/id6670324846)

Use the publisher’s iPhone screenshots as a review reference for compact mobile density, conversation emphasis, and the relative space occupied by secondary controls. **Oracle proposal:** preserve a quiet reading area around the unchanged launcher. Screenshot order and app version can change; take dated reference captures during P1 if exact comparison is needed. Do not infer control dimensions or accessibility quality from marketing screenshots.

### R03 — Separating work in progress from a finished result · H

[Grok 3 announcement and DeepSearch demonstrations](https://x.ai/news/grok-3)

This older launch page demonstrates research as a process leading to a result. **Oracle proposal:** use only real existing loading/streaming states; never invent research stages, percentage progress, or medical reasoning narration. Useful for the optional chat study, not authority for a new agent or a current mobile layout.

## ChatGPT

### R04 — Natural iteration · D

[Use ChatGPT](https://learn.chatgpt.com/docs/use-chatgpt)

Official guidance describes starting with a task and refining through follow-up messages. **Study:** the continuity of one ongoing exchange. **Oracle proposal:** preserve the selected conversation and provide an understandable resume label on Home. Existing suggested questions may be presented clearly where already available. No new generated suggestion service is included.

### R05 — Chats and context belong together · D/V

[Projects and chats](https://learn.chatgpt.com/docs/projects)

The documentation groups related chats, files, instructions, and sources within projects. **Study:** keeping the conversation distinct from the material it uses. **Oracle proposal:** My Health organizes the existing plan and record destinations; profile identity remains explicit. Projects are an information-organization analogy only. They are not a model for family permissions or a proposal to introduce project memory.

### R06 — Clear task entry and recent work · D/V

[ChatGPT on the web](https://learn.chatgpt.com/docs/web)

The official page includes a product illustration with new chat, projects, and recents, and describes choosing a task then refining it. **Oracle proposal:** a quiet Home with useful continuity, rather than equal prominence for every feature. This is a web reference, not evidence for an identical native mobile navigation layout. Oracle headers and navigation chrome stay fixed.

### R07 — Sources are inspectable evidence · D

[Web search in ChatGPT](https://learn.chatgpt.com/docs/web-search)

Use this as a transparency reference: source information should be available for verification. **Oracle proposal:** preserve existing record/source metadata where it is actually supplied. A source-looking tile must not imply that an unsourced clinical statement has been verified. New citation data, web search, or claim-to-source mapping requires separate product work.

## Perplexity

### R08 — Evidence and follow-up near the answer · D

[What is Pro Search?](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search)

The official documentation describes direct source links and contextual follow-up. **Study:** making an answer inspectable and giving the reader a clear next step. **Oracle proposal:** clear lab/date metadata, existing question rows, and recognizable document destinations. Do not duplicate its research behavior or copy product claims about answer accuracy into health UI.

### R09 — A conversation remains a coherent unit · D

[What is a Session?](https://www.perplexity.ai/help-center/en/articles/10354769-what-is-a-thread)

The opened page uses “Session,” despite the historical “thread” URL. It groups questions, follow-ups, responses, and sources. **Oracle proposal:** consultation history should retain its conversation identity, title, date, and answered/in-progress state. Do not flatten all consultations into a synthetic health timeline or use visual grouping to merge different people’s records.

### R10 — Persistent context and organized material · D

[What are Projects?](https://www.perplexity.ai/help-center/en/articles/10352961-what-are-projects)

The current help page describes projects with files and context. **Oracle proposal:** My Health should give a clear home to existing records and care material. This replaces reliance on older Spaces screenshots as current product evidence. Do not bring project collaboration, automated memory updates, connectors, or permissions into the overhaul.

### R11 — Files have visible identity · D

[File Uploads](https://www.perplexity.ai/help-center/en/articles/10354807-file-uploads)

The documentation describes attaching files as conversation context. **Study:** the uploaded item is a recognizable object the user can refer to. **Oracle proposal:** existing lab rows show available report name, collection date and review state with clear open affordances. Keep the current upload/confirmation flow and accepted file types. The reference does not authorize changing the locked composer attachment UI.

## Claude

### R12 — Outputs deserve a distinct reading surface · D

[What are artifacts and how do I use them?](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)

The current help article describes self-contained outputs that can be revisited and edited separately from conversation. **Study:** the difference between talking about a document and reading it. **Oracle proposal:** Visit Notes open as a focused document with the current save, PDF and follow-up actions. Do not add collaborative editing, templates, AI rewriting, version history, or public publication.

### R13 — Conversation and working material · H/V

[Collaborate with Claude on Projects — 25 June 2024](https://www.anthropic.com/news/projects)

This historical announcement includes product screenshots of project knowledge and a separate artifact panel. **Oracle proposal:** distinguish health records, reusable notes, and the chat that produced them. On a phone, retain the existing modal/push presentation; do not shrink a desktop side-by-side panel into a cramped two-column layout.

### R14 — Cross-surface continuity · D/V

[Download Claude](https://claude.com/download)

The official download page describes continuing conversations across devices and presents mobile access. **Oracle proposal:** a resume affordance should name the existing conversation and return to its current state. Cross-device sync is not being added to this frontend prototype.

### R15 — Native mobile reference set · V

[Claude by Anthropic — publisher App Store listing](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684)

Use publisher screenshots for the mobile relationship between reading space, conversation, and utility controls. **Oracle proposal:** calm spacing and restrained controls on long-form notes. Do not copy Claude’s palette, typography, logo, composer, or any control whose behavior the prototype does not implement.

## Accessibility, materials and icon references

### R16 — Accessibility baseline · D

[W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Use AA as the minimum: readable contrast, keyboard access, logical semantics, reflow and visible focus. Oracle’s own 48px hit-target and 7:1 readable-text goals are stronger project targets, not a statement that WCAG AA mandates those exact values everywhere. Test final composited colors, including translucent surfaces, rather than trusting token comments.

### R17 — Sticky elements must not hide focus · D

[W3C: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)

The guidance explicitly identifies sticky headers and footers as potential causes of hidden focused controls. **Oracle application:** all redesigned scroll bodies must keep their final action reachable above the unchanged composer/launcher and keyboard. Reserve space without modifying the locked input surface.

### R18 — Backdrop blur behavior · D

[MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)

Backdrop effects act on the content behind a translucent element and have compositing constraints. **Oracle proposal:** bounded scroll-edge effects, not blur on every card. This is an implementation reference, not evidence that any reference app uses a particular CSS blur radius.

### R19 — Reduced transparency · D

[MDN: prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency)

The media feature expresses a user preference to reduce translucent effects; support must be checked on target browsers. **Oracle proposal:** an opaque semantic-token fallback that remains usable even without preference detection or backdrop-filter support. Avoid making translucency necessary to understand a boundary.

### R20 — Existing free icon family · D

[Hugeicons: free icons and licensing](https://hugeicons.com/docs/faqs/license-questions)

The vendor identifies the free Stroke Rounded package as MIT licensed, distinct from its paid families. **Oracle proposal:** keep the installed free package behind the existing `Icon` adapter and preserve its license notices. Flat UI does not require filled icons. Do not introduce paid styles or mix a second icon family simply to make the screen feel new.

## Screen-to-reference map

| Oracle surface | Primary references | Exact design exercise |
|---|---|---|
| Home, first useful screen | R01, R02, R04, R06 | Reduce competing visual priorities while retaining all eligible existing actions |
| Home, returning | R04, R05, R09, R14 | Give the existing conversation a recognizable title/date/action |
| Home, established | R05, R10 | Present the current plan/habits without inventing a wellness score |
| Chat compatibility | R03, R04, R08, R09 | Preserve real streaming, turn sequence, follow-ups and result boundaries |
| My Health | R05, R10, R13 | Separate current work from the record collection |
| Family | R05, R10 as organization analogies only | Make person context clear; preserve Oracle’s own profile rules |
| Visit Notes | R12, R13, R15 | Treat the saved output as a readable document |
| Labs and records | R07, R08, R09, R11 | Show available provenance, dates and statuses honestly |
| Library/content detail | R08, R10, R12 | Useful titles, content type, existing reason, calm reading surface |
| All interactive bodies | R16, R17, R20 | Accessible targets and focus; consistent labeled icons |
| Optional progressive edge | R18, R19 | A restrained effect with reliable opaque fallback |

## P1 reference board brief

Prepare a small dated board alongside future compositions: direct-entry Home references from Grok, continuity/context references from ChatGPT, evidence and follow-up references from Perplexity, and document/output references from Claude. Each capture must include its source URL, capture date, platform and a one-sentence lesson. Mark historical and marketing imagery accordingly. Use public publisher imagery or user-provided captures; do not require new accounts to keep the project moving.

Pair each reference with an Oracle composition using Oracle tokens. Review the transfer of hierarchy and interaction, not visual similarity. Do not use a generic gallery of attractive AI interfaces as acceptance evidence. The screen-to-reference map above is the initial board index; actual pixel comparisons remain a P1 design activity.

## Research limitations and exclusions

- Public pages can change after this research date; exact native layouts need fresh captures before a pixel-specific decision.
- Older Perplexity Spaces and Claude launch pages are not treated as current feature inventories.
- No source establishes that all four apps use borderless cards, progressive blur, or the same icon style. Those are the user’s requested Oracle design choices.
- Family-health UX is an Oracle-specific design problem. Workspace organization in AI apps does not establish appropriate family access or consent rules.
- No competitive feature is automatically authorized. Real-time web search, model switching, generated health insights, memory changes, autonomous tasks, sharing and new voice behavior are outside this overhaul.
- This is product/UX research, not medical, legal, or regulatory advice. Existing clinical and legal copy remains unchanged.
