const sqlite3 = require('sqlite3').verbose()
const SQLITE_FILE = 'db.sqlite3'

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

const db = new sqlite3.Database(SQLITE_FILE, (err) => {
  if (err) {
    // Cannot open database
    console.error('Could not connect to database')
    console.error(err.message)
    throw err
  } else {
    console.log('Connected to the SQLite database.')
    db.run(schema, (err) => {
      if (err) {
        // Problem creating table
        console.error('Could not create table')
        console.error(err.message)
      }
    })
  }
})

module.exports = db
