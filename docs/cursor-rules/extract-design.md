# Design System Extraction Rules

**Last Updated:** 2025-08-19

## ANALYZE: the image pasted
OBJECTIVE
Extract a comprehensive and reusable design system from the image pasted, excluding any specific visual content, to create a JSON reference that developers or AI systems can use as a styling foundation for consistent UI development.

INSTRUCTIONS
- Examine the image pasted to identify:
  • Color schemes and palettes
  • Font hierarchies and typography standards
  • Spacing and margin conventions
  • Structural layouts (grid systems, card designs, wrapper elements, etc.)
  • Interactive elements (button styles, form inputs, data tables, etc.)
  • Visual effects (corner rounding, drop shadows, and additional styling treatments)
- Generate a design-system.json file that systematically documents these design principles
- Save the JSON output to the designs directory using filename: design.json

REQUIREMENTS
- Prioritize extracting scalable design tokens over copying specific interface content
- Structure JSON with clear hierarchy and developer-accessible formatting
- Include complete color systems, font scaling, and dimensional standards
- Record component variations and interaction states where visible
- Follow contemporary design system best practices
- Omit any literal text, imagery, or data from source screenshots
- Create framework-independent output suitable for any implementation environment

OUTPUT FORMAT
Create a comprehensive design.json file with the following structure:
```json
{
  "colors": {
    "primary": { "50": "#...", "100": "#...", "500": "#...", "600": "#...", "900": "#..." },
    "secondary": { "50": "#...", "100": "#...", "500": "#...", "600": "#...", "900": "#..." },
    "accent": { "success": "#...", "warning": "#...", "error": "#...", "info": "#..." }
  },
  "typography": {
    "fontFamily": { "primary": "...", "secondary": "...", "mono": "..." },
    "fontSize": { "xs": "...", "sm": "...", "base": "...", "lg": "...", "xl": "...", "2xl": "...", "3xl": "...", "4xl": "..." },
    "fontWeight": { "normal": "...", "medium": "...", "semibold": "...", "bold": "..." }
  },
  "spacing": {
    "xs": "...", "sm": "...", "md": "...", "lg": "...", "xl": "...", "2xl": "...", "3xl": "..."
  },
  "components": {
    "button": { "height": "...", "padding": "...", "borderRadius": "...", "fontWeight": "..." },
    "card": { "padding": "...", "borderRadius": "...", "shadow": "..." },
    "input": { "height": "...", "padding": "...", "borderRadius": "...", "borderWidth": "..." }
  }
}
```

FILE MANAGEMENT
- Create the designs directory if it doesn't exist
- Save the output as designs/design.json
- Ensure the JSON is properly formatted and valid
- Include all extracted design tokens in a structured format
