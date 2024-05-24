# COMP-4800-37
Recreation of the historical 37 website which contains facts about the number.

# Installation

Contents of .env:
 - `PORT=` - Used to configure the servers listening port (When not set, default: `8000`)
 - `SESSION_SECRET=` - String used to encrypt express-session.
 - `HTTPS_ENABLED=` - Boolean that specifies whether cookies are secure or not (if not defined, cookies default to secure.)
 - `BEHIND_PROXY=` - Configures the server to allow HTTPS/secure cookies when behind a reverse proxy.
 - `BACKUP_INTERVAL=` - How often in milliseconds to backup the database. 
 - `MAX_BACKUPS=` - Max number of backup version stored concurrently. If exceeded, oldest backups will be trimed.
 - `BACKUP_DIR_NAME=` - Name of the directory where database backups will be stored.
 - `MAX_DIR_SIZE=` - Max cumulative file size of the backup directory in MB. If exceeded, oldest backups will be trimed.
 - `UPLOAD_DIR` - Directory to store uploads. (Default if not set: `/app/public/uploads`)
 - `MAX_UPLOAD_DIR_SIZE` - Maximum upload directory size in MB. Will prevent further uploads if exceeded. (Default if not set: 1GB)
 - `MAX_FILE_SIZE` - Maximum individual file size in MB per upload. (Default if not set: 10MB/file)
 - `EMAIL_HOST=` - Name of the outgoing mail server
 - `EMAIL_PORT=` - The port number used by the outgoing mail server
 - `EMAIL_USER=` - Email that sends the report
 - `EMAIL_PASS=` - Password of the email that sends the report
 - `EMAIL_RECEIVER` - Email that receives the report
 - `ANON_EMAIL=` - Placeholder email for the anonymous user.
 - `ANON_PWD=` - Placeholder password for the anonymous user. Best made very complex.
 - `TOMS_PWD` - Password for Tom to use as a site administrator.
 - `SITE_LINK=` - Link to the 37 home page
 - `INIT_DATABASE` - Controls whether to initialize/reset the database on application start. (Useful for deployment with non-persistent storage)

Scripts:
Run the following using 'npm run [cmd]'
 - `resetdb` - Creates all database entitities (e.g. tables, indices) in app.db. Will drop pre-existing entities.
 - `dev` - Run the app using nodemon serving to the localhost at the specified port (default of 8000).