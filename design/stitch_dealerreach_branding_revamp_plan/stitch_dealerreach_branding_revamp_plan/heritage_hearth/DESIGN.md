```markdown
# Design System Document: The Editorial Atelier

## 1. Overview & Creative North Star
**Creative North Star: The Curated Gallery**
This design system moves away from the "software" aesthetic and toward high-end editorial publishing. It treats every screen as a physical space—a luxury kitchen showroom where the "white space" isn't empty, but represents the air and light within a premium interior. 

To break the "template" look, we utilize **Intentional Asymmetry**. Photography should rarely be perfectly centered; instead, let images bleed off-canvas or sit offset against typography. Overlap text onto image containers using `surface-container-lowest` backgrounds to create a layered, architectural depth. This system isn't just a grid; it’s a composition of light, texture, and refined hierarchy.

---

## 2. Colors
Our palette is a study in "Warm Minimalism." We avoid the clinical coldness of pure white (#FFFFFF) in favor of ivory and cream tones that mimic natural stone and high-end cabinetry.

### The Palette
- **Primary (`#775a19`):** Our "Muted Gold." Use this for brand moments, primary CTAs, and active states.
- **Surface (`#fbf9f4`):** Our "Warm Ivory." This is the canvas.
- **On-Surface (`#1b1c19`):** Our "Deep Charcoal." Use this for maximum readability and a high-contrast, premium feel.
- **Secondary (`#565e74`):** A sophisticated slate blue-grey used for supporting UI elements.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. We do not use "lines" to define space. Boundaries must be created through:
- **Background Color Shifts:** A section using `surface-container-low` sitting against a `surface` background.
- **Tonal Transitions:** Using the `surface-container` tiers to distinguish content blocks.

### The "Glass & Gradient" Rule
To add "soul" to the digital interface:
- **Glassmorphism:** For floating navigation or modal overlays, use a semi-transparent `surface-container-lowest` with a `backdrop-blur` of 20px.
- **Signature Textures:** Use subtle linear gradients on primary buttons (transitioning from `primary` to `primary_container`) to mimic the soft sheen of brushed brass.

---

## 3. Typography
The type system relies on the tension between the classic authority of **Noto Serif** and the modern precision of **Inter**.

- **Display & Headlines (Noto Serif):** These are our "Statement Pieces." Use `display-lg` (3.5rem) with generous tracking to lead the user's eye. Serifs convey heritage and craftsmanship.
- **Body & Titles (Inter):** These represent "Modern Engineering." Inter provides the clarity required for technical specifications of high-end appliances.
- **Hierarchy as Identity:** Use high-contrast sizing. A `display-lg` headline should sit near a `body-md` description to create a sophisticated, editorial "Scale Shock" that feels intentional and expensive.

---

## 4. Elevation & Depth
We reject traditional drop shadows in favor of **Tonal Layering**.

- **The Layering Principle:** Treat the UI as stacked sheets of fine paper. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift.
- **Ambient Shadows:** If a floating effect is required (e.g., a "Book a Consultation" FAB), use a shadow with a blur of `40px` and an opacity of `6%`. The shadow color must be a tint of `on-surface` (Charcoal), never pure black.
- **The "Ghost Border" Fallback:** If a container needs more definition, use the `outline-variant` token at **15% opacity**. A 100% opaque border is a failure of the system.
- **Glassmorphism:** Use `surface-blur` effects for headers to allow the warm hues of interior photography to bleed through as the user scrolls, maintaining a sense of place.

---

## 5. Components

### Buttons
- **Primary:** Background `primary` (Gold), Text `on-primary` (White). Use a subtle `primary-container` gradient. Radius: `md` (0.375rem).
- **Secondary:** Background `transparent`, "Ghost Border" at 20% opacity. Text `on-surface`.
- **Tertiary:** Text-only with a `primary` underline that expands on hover.

### Input Fields
- **Styling:** No background. Only a bottom "Ghost Border" (`outline-variant` at 20%). 
- **Focus State:** The bottom border transitions to 1px `primary` (Gold). Labels use `label-md` in `on-surface-variant`.

### Cards & Lists
- **Forbid Dividers:** Use vertical whitespace (Scale `12` or `16`) to separate list items.
- **Photography Cards:** Images should use the `DEFAULT` (0.25rem) radius. High-quality appliance shots should take up 60% of the card area, with text floating in a `surface-container-lowest` box that slightly overlaps the image.

### Showroom Specific Components
- **The Specification Grid:** Use `surface-container-highest` for the background of technical spec tables, with `label-sm` for technical headers. No internal grid lines.
- **The "Material Swatch" Chip:** Circular chips (`full` radius) that use high-res textures of marble, wood, or brass instead of flat colors to allow users to select finishes.

---

## 6. Do’s and Don’ts

### Do:
- **Use "White Space" as a Luxury Asset:** Give elements more room than you think they need. Use Spacing Scale `20` (7rem) between major sections.
- **Lead with Imagery:** The photography of the kitchens is the hero. The UI is the frame.
- **Maintain Tonal Unity:** Ensure all "warm white" surfaces feel like they belong to the same family.

### Don’t:
- **Don't use high-contrast borders:** They "cheapen" the look and feel like a standard SaaS product.
- **Don't use default "Blue" for links:** Always use `primary` (Gold) or `on-surface` (Charcoal) with an underline.
- **Don't crowd the layout:** If a section feels "busy," increase the `surface` padding rather than adding a divider.
- **Don't use "Pure Black":** Use `on-surface` (#1b1c19) to keep the look sophisticated and soft.