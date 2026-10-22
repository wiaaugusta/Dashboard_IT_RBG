---
name: enterprise-admin-dashboard-design
description: "Design, implement, or review professional enterprise admin dashboards and internal tools. Use for dashboard UI/UX, admin panels, sidebars, KPI cards, data tables, filters, forms, responsive layouts, accessibility, and visual refreshes that must preserve existing functionality and architecture."
argument-hint: "Describe the dashboard, page, or visual issue to work on"
---

# Enterprise Admin Dashboard Design

Create distinctive, production-ready admin interfaces that help people scan operational data and complete repeated tasks efficiently. Use the project's established framework, architecture, visual identity, and behavior as the starting point. Do not replace working functionality simply to change its appearance.

## Workflow

1. **Inspect before proposing.** Read the relevant pages and nearby components, shared styles/tokens, navigation and routing, and project UI/architecture guidance. Identify the actual framework, component conventions, existing responsive behavior, and interactions or data flows that must remain unchanged. Keep exploration focused on the requested page and shared surfaces it uses.
2. **State constraints and opportunities.** Summarize the current implementation briefly. Separate known requirements from assumptions; do not invent product data, user roles, routes, or functionality. Flag any proposed change that would affect behavior, API contracts, authentication, authorization, routing, or persistence.
3. **Propose a design direction before editing.** Present a concrete, project-compatible direction covering hierarchy, typography, palette and tokens, spacing, navigation, page composition, and responsive behavior. Name the key components and the files or areas likely to change. Explain how the direction makes the interface clearer and more distinctive without introducing a new framework or unrelated architecture changes. Wait for the user's approval before editing UI code, unless the user has already explicitly authorized implementation after the proposal.
4. **Implement narrowly.** After approval, make the smallest coherent presentation-layer changes. Reuse and improve existing components and tokens where practical. Preserve routes, data contracts, roles, actions, validation, loading/error/empty states, and keyboard behavior. Do not replace real data with decorative mock metrics or make nonfunctional controls look operational.
5. **Verify the complete experience.** Run the narrowest relevant checks, then inspect the affected page at desktop and mobile widths. Exercise existing navigation and key interactions. Check keyboard access, visible focus, labels and semantics, contrast, content overflow, and reduced-motion behavior. Fix regressions introduced by the change; report unrelated pre-existing issues separately.

## Visual Quality Bar

- Establish a clear reading order: page title and context, primary action, key metrics or filters, then the main data/work area. Use size, weight, alignment, and spacing consistently; avoid making every region equally prominent.
- Use a deliberate, restrained palette suited to the product and its existing identity. Define or extend semantic design tokens for surfaces, text, borders, accent, status, spacing, radii, and elevation instead of scattering unrelated hard-coded values. Status must not rely on color alone.
- Choose typography that fits the existing environment and improves scanning. Keep a small, consistent type scale for page titles, section headings, body, metadata, table content, and controls. Ensure dense data remains legible.
- Balance density with whitespace. Align page edges, columns, controls, and table content to a consistent grid. Prefer useful hierarchy and clear grouping over decorative cards, excessive borders, oversized empty areas, gradients, heavy shadows, or novelty effects.
- Make the design feel specific to this product: use meaningful labels, realistic content structure, purposeful accent usage, and coherent iconography already available in the project. Avoid generic template layouts, repeated identical cards, decorative charts, arbitrary gradients, emoji icons, and placeholder values presented as real insights.

## Dashboard Components

- **Sidebar and navigation:** Respect the current information architecture. Make the current route and expanded group unmistakable, with coherent hover and keyboard-focus states. Keep labels readable and spacing consistent. On smaller screens, use the project's established drawer or navigation pattern; ensure it opens, closes, and exposes its state accessibly. Use brief transitions only when they clarify state, and honor `prefers-reduced-motion`.
- **Overview and KPI cards:** Prioritize the metrics people need to act on. Include meaningful labels, units, time context, and comparison periods for deltas; communicate neutral, positive, and negative changes clearly. Keep visual weight proportional to importance and avoid charts or trend claims without real data.
- **Tables and lists:** Preserve scanability with aligned columns, clear headers, appropriate number/date formatting, concise status indicators, and predictable row actions. Provide useful empty, loading, and error states. On narrow screens, select a deliberate responsive strategy such as horizontal scrolling with clear affordance or a compact list; do not simply shrink text until the table is unusable.
- **Search and filters:** Keep controls near the results they affect, use explicit labels, and show applied filter state and a clear way to reset it where appropriate. Preserve existing query and filter behavior.
- **Forms and actions:** Group related fields, mark required inputs accessibly, associate errors with fields, and make validation and submission states clear. Preserve existing validation, confirmation, permissions, and submit behavior.
- **Reusable components:** Keep shared elements visually and behaviorally consistent across pages. Extend existing components or tokens before creating near-duplicates; avoid abstractions that make a one-off page harder to maintain.

## Responsive and Accessibility Checks

- Treat mobile as a distinct layout: prioritize the primary task, maintain sensible reading order, prevent horizontal page overflow, and keep controls comfortably operable by touch.
- Check narrow, intermediate, and wide viewports. Verify long labels, localized text, dense tables, menus, dialogs, and validation messages do not overlap or clip.
- Use semantic landmarks and heading order, accessible names for icon-only controls, programmatic labels for inputs, keyboard-operable navigation and actions, visible focus, and appropriate expanded/selected states.
- Check text and meaningful UI contrast against their actual surfaces, not only in isolation. Do not communicate status through color alone.
- Avoid motion that is required to understand state; honor reduced-motion preferences.

## Completion Criteria

Before calling the work complete, confirm:

- The approved direction is reflected consistently across the affected page and any shared components touched.
- Existing routes, data, role permissions, API behavior, and user actions still work; no unrelated functionality was rewritten.
- The page remains coherent and usable on mobile and desktop, with no clipped or overlapping content.
- Keyboard, focus, semantics, contrast, form feedback, and reduced-motion expectations were checked for the changed surface.
- Relevant tests, lint, or build checks were run when available. State what was verified and disclose any checks that could not be run.