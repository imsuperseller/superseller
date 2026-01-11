# 📱 Mobile Audit Checklist

**Created**: January 4, 2026
**Status**: Ready for manual testing
**Test Viewport**: 375x667 (iPhone SE)

---

## Pages to Test

### Core Pages
- [ ] Homepage `/`
- [ ] Hebrew Homepage `/he`
- [ ] Marketplace `/marketplace`
- [ ] Product Detail `/marketplace/[id]`
- [ ] Offers `/offers`
- [ ] Contact `/contact`
- [ ] Custom `/custom`

### Niche Pages
- [ ] Niches Index `/niches`
- [ ] E-commerce `/niches/ecommerce`
- [ ] Healthcare `/niches/healthcare`
- [ ] Legal `/niches/legal`
- [ ] Hebrew Niches `/he/niches`

### Auth/Dashboard
- [ ] Login `/login`
- [ ] Success `/success`
- [ ] Dashboard `/dashboard/[clientId]`

---

## Check for Each Page

### Layout
- [ ] No horizontal scroll
- [ ] Text readable without zooming
- [ ] Images scale properly
- [ ] Buttons large enough to tap (min 44x44px)

### Navigation
- [ ] Mobile menu opens correctly
- [ ] All links work
- [ ] Back button works
- [ ] Phone number clickable

### Content
- [ ] No text overflow/cut off
- [ ] Videos play on mobile
- [ ] Forms are usable
- [ ] Cards stack properly

### Performance
- [ ] Page loads in <3 seconds
- [ ] No jank during scroll
- [ ] Animations smooth

---

## Known Issues (Audit Jan 4, 2026)

| Page | Issue | Priority |
| :--- | :--- | :--- |
| Global (Hebrew) | "Call AI Agent" button in mobile menu is in English | P2 |
| Global (Hebrew) | Bottom sticky banner "LIMITED AVAILABILITY" is in English | P2 |
| Global | Language toggle (bottom-left) overlaps bottom sticky banner | P1 |
| Global | WhatsApp button (bottom-right) overlaps "Check Compatibility" button in footer | P2 |
| Global (Hebrew) | Core brand "Rensto" text in hero/menu could be localized if appropriate | P3 |
| Marketplace | Horizontal scroll in filter tabs (Expected - no fix needed) | P4 |
| Custom | Quiz results screen text slightly tight on small screens | P3 |

---

## How to Test

### Chrome DevTools
1. Open Chrome DevTools (F12)
2. Click device toolbar icon
3. Select "iPhone SE" or set to 375x667
4. Refresh page
5. Test each item above

### Real Device Testing
- iOS: Safari on iPhone
- Android: Chrome on Android

---

## After Audit

1. Document all issues found in table above
2. Create GitHub issues or update GAPS.md
3. Fix critical issues (P1)
4. Schedule fix for minor issues (P2/P3)
