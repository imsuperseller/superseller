Skip to contentNavigation Menu
Sign in Appearance settings
AI CODE CREATION
1 GitHub Copilot Write better code with AI
2 GitHub Spark Build and deploy intelligent apps
3 GitHub Models Manage and compare prompts
4 MCP RegistryNewIntegrate external tools
DEVELOPER WORKFLOWS
1 Actions Automate any workflow
2 Codespaces Instant dev environments
3 Issues Plan and track work
4 Code Review Manage code changes
APPLICATION SECURITY
1 GitHub Advanced Security Find and fix vulnerabilities
2 Code security Secure your code as you build
3 Secret protection Stop leaks before they start
EXPLORE
1 Why GitHub
2 Documentation
3 Blog
4 Changelog
5 Marketplace
0 View all features
BY COMPANY SIZE
1 Enterprises
2 Small and medium teams
3 Startups
4 Nonprofits
BY USE CASE
1 App Modernization
2 DevSecOps
3 DevOps
4 CI/CD
5 View all use cases
BY INDUSTRY
1 Healthcare
2 Financial services
3 Manufacturing
4 Government
5 View all industries
0 View all solutions
EXPLORE BY TOPIC
1 AI
2 Software Development
3 DevOps
4 Security
5 View all topics
EXPLORE BY TYPE
1 Customer stories
2 Events & webinars
3 Ebooks & reports
4 Business insights
5 GitHub Skills
SUPPORT & SERVICES
1 Documentation
2 Customer support
3 Community forum
4 Trust center
5 Partners
COMMUNITY
1 GitHub Sponsors Fund open source developers
PROGRAMS
1 Security Lab
2 Maintainer Community
3 Accelerator
4 Archive Program
REPOSITORIES
1 Topics
2 Trending
3 Collections
ENTERPRISE SOLUTIONS
1 Enterprise platform AI-powered developer platform
AVAILABLE ADD-ONS
1 GitHub Advanced Security Enterprise-grade security features
2 Copilot for Business Enterprise-grade AI features
3 Premium Support Enterprise-grade 24/7 support
0 Pricing
Search code, repositories, users, issues, pull requests...
Clear
Search syntax tips Provide feedback
We read every piece of feedback, and take your input very seriously.
Saved searches
Use saved searches to filter your results more quickly
To see all available qualifiers, see our documentation.
Sign in Sign up Appearance settings You signed in with another tab or window. Reload to refresh your session. You signed out in another tab or window. Reload to refresh your session. You switched accounts on another tab or window. Reload to refresh your session. Dismiss alert {{ message }} obra / superpowersPublic
Uh oh!
There was an error while loading. Please reload this page.
1 Notifications You must be signed in to change notification settings
2 Fork 3.6k
3 Star 47.2k
An agentic skills framework & software development methodology that works.
License
0 MIT license 47.2k stars 3.6k forks Branches Tags Activity Star Notifications You must be signed in to change notification settings
Additional navigation options
1 Code
2 Issues
3 Pull requests
4 Actions
5 Projects
6 Security
7 Insights
obra/superpowers
BranchesTagsOpen more actions menu
Folders and files
Name Name Last commit message Last commit date
Latest commit
History
270 Commits270 Commits.claude-plugin.claude-plugin.codex.codex.github.github.opencode.opencodeagentsagentscommandscommandsdocsdocshookshooksliblibskillsskillsteststests.gitattributes.gitattributes.gitignore.gitignoreLICENSELICENSEREADME.mdREADME.mdRELEASE-NOTES.mdRELEASE-NOTES.mdRepository files navigation
Superpowers
Superpowers is a complete software development workflow for your coding agents, built on top of a set of composable "skills" and some initial instructions that make sure your agent uses them.
How it works
It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it doesn't just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do.
Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest.
After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY.
Next up, once you say "go", it launches a subagent-driven-development process, having agents work through each engineering task, inspecting and reviewing their work, and continuing forward. It's not uncommon for Claude to be able to work autonomously for a couple hours at a time without deviating from the plan you put together.
There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has Superpowers.
Sponsorship
If Superpowers has helped you do stuff that makes money and you are so inclined, I'd greatly appreciate it if you'd consider sponsoring my opensource work.
Thanks!
1 Jesse
Installation
Note: Installation differs by platform. Claude Code has a built-in plugin system. Codex and OpenCode require manual setup.
Claude Code (via Plugin Marketplace)
In Claude Code, register the marketplace first:
/plugin marketplace add obra/superpowers-marketplace
Then install the plugin from this marketplace:
/plugin install superpowers@superpowers-marketplace
Verify Installation
Start a new session and ask Claude to help with something that would trigger a skill (e.g., "help me plan this feature" or "let's debug this issue"). Claude should automatically invoke the relevant superpowers skill.
Codex
Tell Codex:
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md
Detailed docs:docs/README.codex.md
OpenCode
Tell OpenCode:
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
Detailed docs:docs/README.opencode.md
The Basic Workflow
brainstorming - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.
using-git-worktrees - Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.
writing-plans - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.
subagent-driven-development or executing-plans - Activates with plan. Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality), or executes in batches with human checkpoints.
test-driven-development - Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit. Deletes code written before tests.
requesting-code-review - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.
finishing-a-development-branch - Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.
The agent checks for relevant skills before any task. Mandatory workflows, not suggestions.
What's Inside
Skills Library
Testing
1 test-driven-development - RED-GREEN-REFACTOR cycle (includes testing anti-patterns reference)
Debugging
1 systematic-debugging - 4-phase root cause process (includes root-cause-tracing, defense-in-depth, condition-based-waiting techniques)
2 verification-before-completion - Ensure it's actually fixed
Collaboration
1 brainstorming - Socratic design refinement
2 writing-plans - Detailed implementation plans
3 executing-plans - Batch execution with checkpoints
4 dispatching-parallel-agents - Concurrent subagent workflows
5 requesting-code-review - Pre-review checklist
6 receiving-code-review - Responding to feedback
7 using-git-worktrees - Parallel development branches
8 finishing-a-development-branch - Merge/PR decision workflow
9 subagent-driven-development - Fast iteration with two-stage review (spec compliance, then code quality)
Meta
1 writing-skills - Create new skills following best practices (includes testing methodology)
2 using-superpowers - Introduction to the skills system
Philosophy
1 Test-Driven Development - Write tests first, always
2 Systematic over ad-hoc - Process over guessing
3 Complexity reduction - Simplicity as primary goal
4 Evidence over claims - Verify before declaring success
Read more: Superpowers for Claude Code
Contributing
Skills live directly in this repository. To contribute:
1 Fork the repository
2 Create a branch for your skill
3 Follow the writing-skills skill for creating and testing new skills
4 Submit a PR
See skills/writing-skills/SKILL.md for the complete guide.
Updating
Skills update automatically when you update the plugin:
/plugin update superpowers
License
MIT License - see LICENSE file for details
Support
1 Issues: https://github.com/obra/superpowers/issues
2 Marketplace: https://github.com/obra/superpowers-marketplace
About
An agentic skills framework & software development methodology that works.
Resources
Readme License
MIT license Uh oh!
There was an error while loading. Please reload this page.
ActivityStars
47.2k starsWatchers
270 watchingForks
3.6k forks Report repository Releases 2
v4.1.1 Latest Jan 23, 2026 + 1 releaseSponsor this project
Uh oh!
There was an error while loading. Please reload this page.
Learn more about GitHub SponsorsPackages 0
No packages published
Uh oh!
There was an error while loading. Please reload this page.
Contributors 16
+ 2 contributorsLanguages
1 Shell 76.1%
2 JavaScript 12.4%
3 Python 5.7%
4 TypeScript 4.3%
5 Batchfile 1.5%
You can’t perform that action at this time.