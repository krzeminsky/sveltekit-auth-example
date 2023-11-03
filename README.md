# SvelteKit email/password/verification code + Google example
Made with lucia, better-sqlite3, redis, nodemailer and tailwindcss.

## redis
Start a linux redis server using `sudo service redis-server start`.

## https
In the example, a self signed certificate was used, although it's not required.

To make one yourself, follow this guide on stackoverflow https://stackoverflow.com/a/76525335

## .env
```env
DATABASE_PATH=""
SENDER_EMAIL=""
TEST_RECEIVER_EMAIL=""
GMAIL_PASS=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""
```
