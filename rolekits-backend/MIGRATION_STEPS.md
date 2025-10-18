# Database Migration Script

This script helps migrate from the old FastAPI schema to the new NestJS/TypeORM schema.

## Option 1: Fresh Start (Recommended for Development)

If you don't need to preserve existing data, you can drop and recreate the database:

```bash
# Connect to PostgreSQL
psql -h 149.200.251.12 -U husain -d rolekits

# Drop existing tables
DROP TABLE IF EXISTS cvs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

# Exit psql
\q
```

Then restart the NestJS application - TypeORM will create the new schema automatically.

## Option 2: Migrate Existing Data

If you need to preserve existing data, run these SQL commands:

```sql
-- Connect to the database first
psql -h 149.200.251.12 -U husain -d rolekits

-- Backup existing data (optional but recommended)
CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE cvs_backup AS SELECT * FROM cvs;

-- Rename columns in users table
ALTER TABLE users RENAME COLUMN hashed_password TO "hashedPassword";

-- For CVs table - this is more complex due to the foreign key
ALTER TABLE cvs DROP CONSTRAINT IF EXISTS cvs_user_id_fkey;
ALTER TABLE cvs RENAME COLUMN user_id TO "userId";
ALTER TABLE cvs RENAME COLUMN full_name TO "fullName";
ALTER TABLE cvs RENAME COLUMN created_at TO "createdAt";
ALTER TABLE cvs RENAME COLUMN updated_at TO "updatedAt";

-- Recreate foreign key with new column name
ALTER TABLE cvs ADD CONSTRAINT "FK_cvs_userId" 
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- Drop old indexes
DROP INDEX IF EXISTS ix_users_id;
DROP INDEX IF EXISTS ix_users_username;
DROP INDEX IF EXISTS ix_cvs_id;

-- TypeORM will create new indexes automatically
```

## Quick Fresh Start Command

```bash
PGPASSWORD=tt55oo77 psql -h 149.200.251.12 -U husain -d rolekits -c "DROP TABLE IF EXISTS cvs CASCADE; DROP TABLE IF EXISTS users CASCADE;"
```

Then run:
```bash
npm run start:dev
```

TypeORM will automatically create the new schema with proper column names.
