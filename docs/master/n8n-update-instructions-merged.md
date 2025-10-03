

---
# From: n8n-update-instructions.md
---

Below is a reliable, no-loss upgrade runbook for n8n Community Edition (self-hosted). It preserves workflows, credentials, and history by (1) persisting the user folder/database, (2) keeping the same encryption key, and (3) taking export + file backups before you pull a new image.

⸻

0) Pre-checks (1 minute)
	1.	Identify how n8n runs now (Docker vs Compose)

docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Mounts}}"

You should see your n8n container name (often n8n) and a volume mapped to /home/node/.n8n. That user folder contains the SQLite DB (if you use SQLite) and the encryption key. n8n uses SQLite by default at ~/.n8n/database.sqlite unless you configured Postgres.  

	2.	Confirm DB type

docker inspect n8n | grep -E 'DB_TYPE|POSTGRES'

	•	If nothing set → you’re on SQLite (default). DB file lives in the user folder.  
	•	If DB_TYPE=postgresdb → you’re on PostgreSQL.

	3.	Locate/record the encryption key
	•	n8n auto-generates and stores a key in the ~/.n8n folder on first launch, used to encrypt credentials. Keep this key identical across upgrades (or set it explicitly via N8N_ENCRYPTION_KEY).  

⸻

1) Backups (belt + suspenders)

A) Export logical backups (CLI)

These let you restore even if a file copy goes wrong.

Run these with the container running (or use a one-shot container that mounts the same volume):

# Create an exports dir inside the user folder
docker exec -it n8n bash -lc 'mkdir -p ~/.n8n/exports'

# Export ALL workflows
docker exec -it n8n n8n export:workflow --all \
  --output=/home/node/.n8n/exports/workflows.all.json

# Export ALL credentials (decrypted)
docker exec -it n8n n8n export:credentials --all --decrypted \
  --output=/home/node/.n8n/exports/credentials.decrypted.json

n8n’s official CLI supports export:workflow and export:credentials; --decrypted requires the correct encryption key (which your running instance has).  

B) Snapshot the persistent data (files)

If you use Docker volume for /home/node/.n8n (most common)

# Replace n8n_data with your volume name from `docker ps`
VOL=n8n_data
mkdir -p ~/n8n-backups
docker run --rm -v $VOL:/data -v $HOME/n8n-backups:/backup alpine \
  sh -c 'cd /data && tar czf /backup/n8n-user-folder_$(date +%F_%H%M).tgz .'

This tarball contains:
	•	database.sqlite (if SQLite)
	•	the encryption key (and settings)
	•	your exported JSONs above

n8n docs explicitly recommend persisting this folder; it’s the source of truth for SQLite and the key.  

If you use PostgreSQL

Run a DB dump as well:

# adjust host/user/db
PGPASSWORD="****" pg_dump -Fc -h <host> -U <user> <dbname> > ~/n8n-backups/n8n_pg_$(date +%F_%H%M).dump

(Keep persisting /home/node/.n8n anyway because it still stores the key and other assets.)  

⸻

2) Pin (or record) the current version (for rollback)

docker ps --format '{{.Image}}' | grep n8n
# Example output: docker.n8n.io/n8nio/n8n:1.112.3

n8n lets you pull specific tags; note the exact tag so you can revert fast if needed.  

⸻

3) Ensure the encryption key is fixed at startup

Edit your docker-compose.yml (recommended) or your docker run command to include:

environment:
  - N8N_ENCRYPTION_KEY=<your-existing-key>

Using a fixed N8N_ENCRYPTION_KEY guarantees credentials decrypt after upgrade.  

Where does the key come from?
n8n saved one in ~/.n8n on first launch. You can keep using that or set an explicit value; just don’t change it later.  

⸻

4) Upgrade (safe sequence)

A) If you use Docker Compose

# From the directory with your docker-compose.yml
docker compose pull         # fetch latest (or pin to a target tag first)
docker compose down         # stop old containers
docker compose up -d        # start upgraded containers

This is the official update method for Compose.  

B) If you use a single docker run

# Pull the image you want (latest stable or a specific tag)
docker pull docker.n8n.io/n8nio/n8n:latest

# Stop and remove the old container (data is safe in the volume)
docker stop n8n && docker rm n8n

# Recreate with the same volume + explicit encryption key
docker run -d --name n8n -p 5678:5678 \
  -e TZ="America/Chicago" \
  -e GENERIC_TIMEZONE="America/Chicago" \
  -e N8N_ENCRYPTION_KEY="<your-existing-key>" \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
  -e N8N_RUNNERS_ENABLED=true \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n:latest

n8n’s Docker docs describe pulling a new tag, stopping the container, and starting again.  

Why this works safely: Your persistent volume keeps the DB + key. On boot, n8n runs DB migrations and reuses the same key, so credentials decrypt and workflows remain intact.  

⸻

5) Post-upgrade validation (don’t skip)
	1.	Open n8n → Settings › About, confirm the new version. (Or docker logs n8n | head -n 50.)
	2.	Test credential decryption

docker exec -it n8n n8n export:credentials --all --decrypted --output=/home/node/.n8n/exports/creds.check.json

If the encryption key mismatched, you’d see “Credentials could not be decrypted”. That error almost always means a different key was used; fix the key and restart.  

	3.	Run a simple workflow with a credentialed node (e.g., HTTP Request using an OAuth2 credential) to confirm tokens decrypt and execute.

⸻

6) Rollback (if anything looks off)

You already recorded your prior tag in step 2.

docker stop n8n && docker rm n8n
docker pull docker.n8n.io/n8nio/n8n:<previous-tag>
docker run -d --name n8n ... -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n:<previous-tag>

You can switch between exact versions; n8n documents pulling specific tags.  

⸻

7) Hardening + ongoing safety
	•	Always persist /home/node/.n8n via a Docker volume or bind mount; it holds the SQLite DB (if used) and the encryption key.  
	•	Set N8N_ENCRYPTION_KEY in Compose/env to make the setup portable and immune to accidental key regeneration.  
	•	Automate backups: keep both exports (CLI JSONs) and file snapshots (volume tar). Schedule with cron or a simple job; many users back up that volume regularly (especially when using SQLite).  
	•	Pin versions (e.g., n8nio/n8n:1.112.3) in production, then roll forward deliberately after you check release notes. n8n’s docs note latest vs next (beta).  

⸻

Quick reference (copy/paste)

Full backup (volume tar)

VOL=n8n_data
mkdir -p ~/n8n-backups
docker run --rm -v $VOL:/data -v $HOME/n8n-backups:/backup alpine \
  sh -c 'cd /data && tar czf /backup/n8n-user-folder_$(date +%F_%H%M).tgz .'

Full export (JSON)

docker exec -it n8n bash -lc 'mkdir -p ~/.n8n/exports'
docker exec -it n8n n8n export:workflow --all \
  --output=/home/node/.n8n/exports/workflows.all.json
docker exec -it n8n n8n export:credentials --all --decrypted \
  --output=/home/node/.n8n/exports/credentials.decrypted.json

Compose update

docker compose pull && docker compose down && docker compose up -d

Single-container update

docker pull docker.n8n.io/n8nio/n8n:latest
docker stop n8n && docker rm n8n
docker run -d --name n8n -p 5678:5678 \
  -e TZ="America/Chicago" -e GENERIC_TIMEZONE="America/Chicago" \
  -e N8N_ENCRYPTION_KEY="<your-existing-key>" \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true -e N8N_RUNNERS_ENABLED=true \
  -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n:latest


⸻

Sources
	•	Official Docker install & updating instructions, plus persistence guidance & defaults (SQLite, user folder) from n8n docs.  
	•	Default SQLite path ~/.n8n/database.sqlite in n8n docs.  
	•	Encryption key behavior & setting N8N_ENCRYPTION_KEY.  
	•	n8n CLI export/import commands.  
	•	Community references on credentials could not be decrypted (root cause: key mismatch).  

If needed, adapt these commands to your exact RackNerd host (compose file, volume names, and the current tag on http://173.254.201.134:5678) and produce a one-shot upgrade script.

---
# From: n8n-update-instructions.md
---

Below is a reliable, no-loss upgrade runbook for n8n Community Edition (self-hosted). It preserves workflows, credentials, and history by (1) persisting the user folder/database, (2) keeping the same encryption key, and (3) taking export + file backups before you pull a new image.

⸻

0) Pre-checks (1 minute)
	1.	Identify how n8n runs now (Docker vs Compose)

docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Mounts}}"

You should see your n8n container name (often n8n) and a volume mapped to /home/node/.n8n. That user folder contains the SQLite DB (if you use SQLite) and the encryption key. n8n uses SQLite by default at ~/.n8n/database.sqlite unless you configured Postgres.  

	2.	Confirm DB type

docker inspect n8n | grep -E 'DB_TYPE|POSTGRES'

	•	If nothing set → you’re on SQLite (default). DB file lives in the user folder.  
	•	If DB_TYPE=postgresdb → you’re on PostgreSQL.

	3.	Locate/record the encryption key
	•	n8n auto-generates and stores a key in the ~/.n8n folder on first launch, used to encrypt credentials. Keep this key identical across upgrades (or set it explicitly via N8N_ENCRYPTION_KEY).  

⸻

1) Backups (belt + suspenders)

A) Export logical backups (CLI)

These let you restore even if a file copy goes wrong.

Run these with the container running (or use a one-shot container that mounts the same volume):

# Create an exports dir inside the user folder
docker exec -it n8n bash -lc 'mkdir -p ~/.n8n/exports'

# Export ALL workflows
docker exec -it n8n n8n export:workflow --all \
  --output=/home/node/.n8n/exports/workflows.all.json

# Export ALL credentials (decrypted)
docker exec -it n8n n8n export:credentials --all --decrypted \
  --output=/home/node/.n8n/exports/credentials.decrypted.json

n8n’s official CLI supports export:workflow and export:credentials; --decrypted requires the correct encryption key (which your running instance has).  

B) Snapshot the persistent data (files)

If you use Docker volume for /home/node/.n8n (most common)

# Replace n8n_data with your volume name from `docker ps`
VOL=n8n_data
mkdir -p ~/n8n-backups
docker run --rm -v $VOL:/data -v $HOME/n8n-backups:/backup alpine \
  sh -c 'cd /data && tar czf /backup/n8n-user-folder_$(date +%F_%H%M).tgz .'

This tarball contains:
	•	database.sqlite (if SQLite)
	•	the encryption key (and settings)
	•	your exported JSONs above

n8n docs explicitly recommend persisting this folder; it’s the source of truth for SQLite and the key.  

If you use PostgreSQL

Run a DB dump as well:

# adjust host/user/db
PGPASSWORD="****" pg_dump -Fc -h <host> -U <user> <dbname> > ~/n8n-backups/n8n_pg_$(date +%F_%H%M).dump

(Keep persisting /home/node/.n8n anyway because it still stores the key and other assets.)  

⸻

2) Pin (or record) the current version (for rollback)

docker ps --format '{{.Image}}' | grep n8n
# Example output: docker.n8n.io/n8nio/n8n:1.112.3

n8n lets you pull specific tags; note the exact tag so you can revert fast if needed.  

⸻

3) Ensure the encryption key is fixed at startup

Edit your docker-compose.yml (recommended) or your docker run command to include:

environment:
  - N8N_ENCRYPTION_KEY=<your-existing-key>

Using a fixed N8N_ENCRYPTION_KEY guarantees credentials decrypt after upgrade.  

Where does the key come from?
n8n saved one in ~/.n8n on first launch. You can keep using that or set an explicit value; just don’t change it later.  

⸻

4) Upgrade (safe sequence)

A) If you use Docker Compose

# From the directory with your docker-compose.yml
docker compose pull         # fetch latest (or pin to a target tag first)
docker compose down         # stop old containers
docker compose up -d        # start upgraded containers

This is the official update method for Compose.  

B) If you use a single docker run

# Pull the image you want (latest stable or a specific tag)
docker pull docker.n8n.io/n8nio/n8n:latest

# Stop and remove the old container (data is safe in the volume)
docker stop n8n && docker rm n8n

# Recreate with the same volume + explicit encryption key
docker run -d --name n8n -p 5678:5678 \
  -e TZ="America/Chicago" \
  -e GENERIC_TIMEZONE="America/Chicago" \
  -e N8N_ENCRYPTION_KEY="<your-existing-key>" \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
  -e N8N_RUNNERS_ENABLED=true \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n:latest

n8n’s Docker docs describe pulling a new tag, stopping the container, and starting again.  

Why this works safely: Your persistent volume keeps the DB + key. On boot, n8n runs DB migrations and reuses the same key, so credentials decrypt and workflows remain intact.  

⸻

5) Post-upgrade validation (don’t skip)
	1.	Open n8n → Settings › About, confirm the new version. (Or docker logs n8n | head -n 50.)
	2.	Test credential decryption

docker exec -it n8n n8n export:credentials --all --decrypted --output=/home/node/.n8n/exports/creds.check.json

If the encryption key mismatched, you’d see “Credentials could not be decrypted”. That error almost always means a different key was used; fix the key and restart.  

	3.	Run a simple workflow with a credentialed node (e.g., HTTP Request using an OAuth2 credential) to confirm tokens decrypt and execute.

⸻

6) Rollback (if anything looks off)

You already recorded your prior tag in step 2.

docker stop n8n && docker rm n8n
docker pull docker.n8n.io/n8nio/n8n:<previous-tag>
docker run -d --name n8n ... -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n:<previous-tag>

You can switch between exact versions; n8n documents pulling specific tags.  

⸻

7) Hardening + ongoing safety
	•	Always persist /home/node/.n8n via a Docker volume or bind mount; it holds the SQLite DB (if used) and the encryption key.  
	•	Set N8N_ENCRYPTION_KEY in Compose/env to make the setup portable and immune to accidental key regeneration.  
	•	Automate backups: keep both exports (CLI JSONs) and file snapshots (volume tar). Schedule with cron or a simple job; many users back up that volume regularly (especially when using SQLite).  
	•	Pin versions (e.g., n8nio/n8n:1.112.3) in production, then roll forward deliberately after you check release notes. n8n’s docs note latest vs next (beta).  

⸻

Quick reference (copy/paste)

Full backup (volume tar)

VOL=n8n_data
mkdir -p ~/n8n-backups
docker run --rm -v $VOL:/data -v $HOME/n8n-backups:/backup alpine \
  sh -c 'cd /data && tar czf /backup/n8n-user-folder_$(date +%F_%H%M).tgz .'

Full export (JSON)

docker exec -it n8n bash -lc 'mkdir -p ~/.n8n/exports'
docker exec -it n8n n8n export:workflow --all \
  --output=/home/node/.n8n/exports/workflows.all.json
docker exec -it n8n n8n export:credentials --all --decrypted \
  --output=/home/node/.n8n/exports/credentials.decrypted.json

Compose update

docker compose pull && docker compose down && docker compose up -d

Single-container update

docker pull docker.n8n.io/n8nio/n8n:latest
docker stop n8n && docker rm n8n
docker run -d --name n8n -p 5678:5678 \
  -e TZ="America/Chicago" -e GENERIC_TIMEZONE="America/Chicago" \
  -e N8N_ENCRYPTION_KEY="<your-existing-key>" \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true -e N8N_RUNNERS_ENABLED=true \
  -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n:latest


⸻

Sources
	•	Official Docker install & updating instructions, plus persistence guidance & defaults (SQLite, user folder) from n8n docs.  
	•	Default SQLite path ~/.n8n/database.sqlite in n8n docs.  
	•	Encryption key behavior & setting N8N_ENCRYPTION_KEY.  
	•	n8n CLI export/import commands.  
	•	Community references on credentials could not be decrypted (root cause: key mismatch).  

If needed, adapt these commands to your exact RackNerd host (compose file, volume names, and the current tag on http://173.254.201.134:5678) and produce a one-shot upgrade script.