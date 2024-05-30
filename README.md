# COMP-4800-37
Recreation of the historical 37 website which contains facts about the number.

# Installation
To install, you must configure the applications environment variables via an `.env` file that should be created in the root directory. Optionally, you may run the script to extract the original site data and then reset the database.

## `.env` Configuration
Required Variables:
 - `SITE_LINK` - Link to the 37 home page
 - `TOMS_PWD` - Password for Tom to use as a site administrator.
 - `ANON_EMAIL` - Placeholder email for the anonymous user.
 - `ANON_PWD` - Placeholder password for the anonymous user. Best made very complex.
 - `SESSION_SECRET` - String used to encrypt express-session.
 - `EMAIL_HOST` - Name of the outgoing mail server
 - `EMAIL_PORT` - The port number used by the outgoing mail server
 - `EMAIL_USER` - Email that sends the report
 - `EMAIL_PASS` - Password of the email that sends the report
 - `EMAIL_RECEIVER` - Email that receives the report
 
Optional Variables (Can be omitted or have default values):
 - `PORT` - Used to configure the servers listening port (Defaults to: `8000`)
 - `HTTPS_ENABLED` - Boolean that specifies whether cookies are secure or not (Defaults to: `true` for added security.)
 - `BEHIND_PROXY` - Configures the server to allow HTTPS/secure cookies when behind a reverse proxy. (Defaults to `false`; assumes HTTPS throughout the entire connection.)
 - `BACKUP_INTERVAL` - How often in milliseconds to backup the database.  (Defaults to: 1 day)
 - `MAX_BACKUPS` - Max number of backup version stored concurrently. If exceeded, oldest backups will be trimed. (Defaults to: 100 backups)
 - `BACKUP_DIR_NAME` - Name of the directory where database backups will be stored. (Defaults to: `/db_backups/`)
 - `MAX_DIR_SIZE` - Max cumulative file size of the backup directory in MB. If exceeded, oldest backups will be trimed. (Defaults to: 10MB)
 - `UPLOAD_DIR` - Directory to store uploads. (Defaults to: `/app/public/uploads`)
 - `MAX_UPLOAD_DIR_SIZE` - Maximum upload directory size in MB. Will prevent further uploads if exceeded. (Defaults to: 1GB)
 - `MAX_FILE_SIZE` - Maximum individual file size in MB per upload. (Defaults to: 10MB/file)
 - `INIT_DATABASE` - Controls whether to initialize/reset the database on application startup. (Useful for deployment with non-persistent storage)

## Scripts:
Run the following using 'npm run [cmd]'
 - `start` - Runs the app normally on the specified port (default 8000).
 - `extractSampleData` - A single-use script that will extract and parse a new `insertSampleData.sql` file to seed the database with. Data fetched from the original [thirty-seven](thirty-seven.org) website.
 - `resetdb` - Creates all database entities (e.g. tables, indices) in app.db. Will drop pre-existing entities. Should only be run once the server has stopped.
 - `dev` - Run the app using nodemon serving to the localhost at the specified port (default of 8000).

# Attributions
The following resources were used in some way in the application:

1. "No Name 37" [Font by Igor Kosinsky](https://www.dafont.com/no-name-37.font)
2. "Planet 37" [Font by Tokopress](https://justtheskills.com/product/planet-37/) NOTE: This font **requires** a license to use.
