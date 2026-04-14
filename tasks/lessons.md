# Lessons Learned

## Project-Specific Patterns

### Mobile Development
- **Date:** 2026-04-10
- **Lesson:** Always consider mobile from the start. Retrofitting responsive design is more work.
- **Pattern:** Use drawer navigation for complex sidebars on mobile, not bottom tabs.
- **Rule:** Test at 768px, 640px, and 375px breakpoints for full coverage.

### Dependency Management
- **Date:** 2026-04-10
- **Lesson:** ESLint ecosystem moves fast. Plugin compatibility lags behind major versions.
- **Pattern:** When seeing peer dependency conflicts, check plugin compatibility first before upgrading core packages.
- **Rule:** Use `.npmrc` with `legacy-peer-deps=true` for projects with many plugins.

### State Management
- **Date:** 2026-04-10
- **Lesson:** localStorage is sufficient for small apps, but needs structure.
- **Pattern:** Create separate keys for different data types (`elk-custom-units`, `elk-gear-list`, etc.)
- **Rule:** Always provide default values when loading from storage to handle empty states.

---

## General Engineering Principles

### Code Organization
- Prefer creating new components over adding complexity to existing ones
- Keep components under 500 lines when possible
- Extract business logic to separate functions

### User Experience
- Mobile users expect ≥44px touch targets
- Auto-close mobile menus on selection for better UX
- Use responsive padding classes instead of hardcoded values

### Documentation
- Create user guides for complex features (DRAW_DIFFICULTY_EXPLAINED.md)
- Document deployment options clearly (AWS_DEPLOYMENT.md)
- Include troubleshooting sections

---

## Anti-Patterns to Avoid

### ❌ Don't:
- Mix inline styles with responsive requirements (use CSS classes)
- Forget to close mobile menus programmatically
- Skip the build test after major changes
- Over-engineer simple features

### ✅ Do:
- Test responsive changes in browser dev tools
- Use semantic HTML and ARIA labels
- Provide fallbacks for experimental features (GoHunt fetch)
- Keep git commits focused and atomic

---

## Future Considerations

### Performance
- Consider code splitting for larger components
- Lazy load map tiles
- Implement service worker for offline support

### Features to Remember
- Delete button for custom units (currently requires DevTools)
- Edit existing custom units
- Export/import custom data
- PWA installation prompt

---

**Last Updated:** 2026-04-10

*This file evolves with the project. Add new lessons immediately after corrections or discoveries.*
