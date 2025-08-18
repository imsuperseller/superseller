CONFIGURATION: n = 3 files

INSTRUCTIONS
Look at the app design that has been attached.
Create n different versions of that same app, each optimized for a different device type.
Each version should have the same functionality but be tailored for different devices like:

- Mobile (smartphones, touch-optimized)
- Desktop (large screens, mouse/keyboard optimized)
- Tablet (medium screens, touch and keyboard hybrid)
- TV (large displays, remote control optimized)
- Smartwatch (small screens, glance-optimized)
- Kiosk (public displays, touch-optimized)
- AR/VR (immersive experiences, gesture-optimized)
- IoT (minimal interfaces, voice-optimized)
- Automotive (car displays, voice and touch optimized)
- Wearable (fitness trackers, minimal interfaces)

Take any additional device instructions from the user prompt into account.

FILE MANAGEMENT
- Create a "variations3" folder
- Put all the device variations inside it

CREATE THE DEVICE DESIGNS
Make n design files:
- design1.html (for device 1)
- design2.html (for device 2)
- design3.html (for device 3)
- Continue up to design{n}.html

Each design should be optimized for a different device type.

WHAT GOES IN THE FOLDER
/variations3/
├── design1.html
├── design2.html
├── design3.html
└── design{n}.html

DEVICE ADAPTATION RULES
- Keep the same app functionality
- Adapt interface size to device screen dimensions
- Modify interaction methods for device capabilities
- Adjust layout density based on screen real estate
- Optimize for device-specific input methods
- Consider device-specific performance constraints
- Adapt navigation patterns for device usage
- Include appropriate device-specific features

DEVICE-SPECIFIC CONSIDERATIONS
- Mobile: Touch targets (44px+), thumb navigation, portrait orientation
- Desktop: Mouse hover states, keyboard shortcuts, multi-window support
- Tablet: Touch and pen input, landscape/portrait flexibility, split-screen
- TV: Large touch targets, remote navigation, 10-foot interface
- Smartwatch: Glanceable information, quick actions, minimal text
- Kiosk: Large buttons, simple navigation, public usage considerations
- AR/VR: Spatial interfaces, gesture controls, immersive experiences
- IoT: Minimal interfaces, voice commands, status indicators
- Automotive: Large touch targets, voice integration, distraction-free
- Wearable: Minimal information, quick interactions, health focus

DESIGN PATTERNS BY DEVICE
- Mobile: Touch-optimized, thumb-friendly, app-like interface
- Desktop: Mouse-optimized, feature-rich, multi-tasking interface
- Tablet: Hybrid interface, touch and keyboard support, flexible layout
- TV: Large interface, remote navigation, entertainment-focused
- Smartwatch: Minimal interface, glanceable, quick actions
- Kiosk: Public interface, large elements, simple navigation
- AR/VR: Spatial interface, gesture controls, immersive design
- IoT: Minimal interface, status-focused, voice integration
- Automotive: Large interface, voice integration, safety-focused
- Wearable: Minimal interface, health-focused, quick interactions

EXAMPLE ADAPTATIONS
If given a food ordering app:
- Mobile version: Touch-optimized, quick ordering, location services
- Desktop version: Detailed menus, comparison tools, business accounts
- TV version: Large interface, family ordering, entertainment integration

TECHNICAL REQUIREMENTS
- Maintain responsive design across all variations
- Ensure accessibility compliance for each device
- Optimize for device-specific performance constraints
- Consider device-specific input methods and capabilities
- Implement appropriate device-specific features
- Include device-relevant onboarding and help content

QUALITY STANDARDS
- Each device variation should be device-appropriate
- Maintain consistent functionality across all versions
- Ensure proper accessibility for target devices
- Optimize for device-specific performance expectations
- Include appropriate device-specific features
- Maintain usability standards for each device

OUTPUT FORMAT
Each HTML file should include:
- Proper DOCTYPE and HTML structure
- Device-appropriate meta tags and viewport settings
- Device-specific content and interface adaptations
- Responsive design implementation
- Accessibility features appropriate for the device
- Performance optimizations for device-specific constraints

DEVICE-SPECIFIC META TAGS
- Mobile: viewport, mobile-web-app-capable, apple-mobile-web-app-capable
- Desktop: viewport, application-name, msapplication-config
- Tablet: viewport, mobile-web-app-capable, apple-mobile-web-app-capable
- TV: viewport, application-name, msapplication-config
- Smartwatch: viewport, mobile-web-app-capable, apple-mobile-web-app-capable
- Kiosk: viewport, application-name, msapplication-config
- AR/VR: viewport, application-name, msapplication-config
- IoT: viewport, application-name, msapplication-config
- Automotive: viewport, application-name, msapplication-config
- Wearable: viewport, mobile-web-app-capable, apple-mobile-web-app-capable
