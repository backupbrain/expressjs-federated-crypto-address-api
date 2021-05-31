const db = require('./config/database.js')

const schema = `
CREATE TABLE IF NOT EXISTS "coin" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" varchar(255) NOT NULL,
  "code" varchar(3) NOT NULL,
  "is_active" bool NOT NULL
);
CREATE TABLE IF NOT EXISTS "wallet_address" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "username" varchar(255) NOT NULL,
  "address" varchar(255) NOT NULL,
  "is_active" bool NOT NULL,
  "coin_id" bigint NOT NULL REFERENCES "coin" ("id") DEFERRABLE INITIALLY DEFERRED
)
`

console.log('Migrating tables...')
db.run(schema, (err) => {
  if (err) {
    // Problem creating table
    console.error('Could not create table')
    console.error(err.message)
  } else {
    console.log('Finished migration')
    console.log('')
    console.log('You may now run `npm run start` to run the API')
  }
})
