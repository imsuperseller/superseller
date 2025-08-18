UI TO BUILD: $ARGUMENTS
OBJECTIVE
Launch 3 concurrent sub-agents in parallel to develop a single UI concept with different approaches, enabling users to compare options and select the most effective solution.

Instructions for each sub-agent:
- Review the styling specifications in designs/design.json, along with reference mockups for guidance
- Construct a standalone HTML page featuring one interface screen that addresses the user requirements/brief
- Save HTML files to infinite_ui_cursor directory using naming convention ui_{n}.html (Where n must be distinct such as ui_1.html, ui_2.html, etc.)

DESIGN APPROACHES
Create 3 distinctly different design philosophies:

1. **Modern Minimalist Approach** (ui_1.html)
   - Clean, spacious layouts with lots of white space
   - Subtle shadows and minimal color palette
   - Focus on typography and content hierarchy
   - Smooth, subtle animations

2. **Bold & Vibrant Approach** (ui_2.html)
   - High contrast colors and bold typography
   - Strong visual elements and prominent CTAs
   - Dynamic layouts with grid systems
   - Eye-catching animations and effects

3. **Functional & Accessible Approach** (ui_3.html)
   - High contrast for accessibility
   - Clear navigation and intuitive interactions
   - Consistent spacing and predictable patterns
   - Focus on usability and performance

REQUIREMENTS
- Each design must be fully functional and responsive
- Use the design tokens from designs/design.json
- Include proper HTML5 semantic structure
- Add CSS for styling (inline or separate)
- Ensure cross-browser compatibility
- Include hover states and interactions
- Make designs mobile-responsive

FILE STRUCTURE
```
infinite_ui_cursor/
├── ui_1.html          # Modern Minimalist approach
├── ui_2.html          # Bold & Vibrant approach
├── ui_3.html          # Functional & Accessible approach
└── source.html        # Reference design (if applicable)
```

QUALITY STANDARDS
- Each design should be production-ready
- Include proper meta tags and viewport settings
- Use semantic HTML elements
- Implement responsive design principles
- Ensure accessibility compliance (WCAG 2.1 AA)
- Optimize for performance and loading speed

OUTPUT FORMAT
Each HTML file should be complete and standalone, including:
- Proper DOCTYPE and HTML structure
- Meta tags for responsiveness and SEO
- Complete CSS styling (inline or in <style> tag)
- Semantic HTML elements
- Responsive design implementation
- Interactive elements with hover states
- Accessibility features (ARIA labels, proper contrast)

EVALUATION CRITERIA
- Visual appeal and modern design trends
- Functionality and user experience
- Accessibility and inclusivity
- Performance and optimization
- Cross-browser compatibility
- Mobile responsiveness
