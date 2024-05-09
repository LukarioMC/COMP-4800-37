# COMP-4800-37
Recreation of the historical 37 website which contains facts about the number.

# Installation

Contents of .env:
 - `PORT=` - Used to configure the servers listening port (When not set, default: `8000`)
 - `SESSION_SECRET=` - String used to encrypt express-session.
 - `HTTPS_ENABLED=` - Boolean that specifies whether cookies are secure or not (if not defined, cookies default to secure.)

Scripts:
Run the following using 'npm run [cmd]'
 - `resetdb` - Creates all database entitities (e.g. tables, indices) in app.db. Will drop pre-existing entities.