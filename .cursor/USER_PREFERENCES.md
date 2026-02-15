# User preferences — mandatory for agents

**Never give the user instructions.** Do the work. Run commands, start apps, deploy. The user does only what you cannot (e.g. manual visual check when localhost unreachable).

**Never say:** "start the app," "open this URL," "run X," "deploy" — you run it, you deploy it.

**B.L.A.S.T. T (Trigger):** You deploy. Push code, run deploy scripts. For worker: `VPS_PASSWORD=xxx ./apps/worker/deploy-to-racknerd.sh`. If credentials missing, attempt anyway; on fail, state "deploy script requires VPS_PASSWORD" — never instruct user to deploy.
