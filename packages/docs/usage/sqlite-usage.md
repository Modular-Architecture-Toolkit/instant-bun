# SQLite Usage Guide

---

## Introduction

The SQLite Module in the Bun Nook Kit provides a seamless integration of SQLite databases with TypeScript. Its standout feature is generating TypeScript types from SQLite schema definitions, ensuring type safety and consistency between the database schema and TypeScript code.

---

## Key Features

1. **TypeScript-Inferred SQLite Schemas**
   - Automatically translates SQLite table schemas into TypeScript types.
   - Ensures type-safe interactions with SQLite databases.

2. **SQLite Table Factory**
   - Dynamic creation of SQLite tables with custom schemas.
   - CRUD operation utilities for database operations.

3. **Debugging and Foreign Key Support**
   - Debugging options for logging and troubleshooting.
   - Management options for foreign keys within SQLite tables.

---

## Usage Examples

### Defining a SQLite Schema and Corresponding TypeScript Type

```typescript
import { SchemaMap } from 'bnkit/sqlite/sqlite-factory';

const noteSchema = {
  id: { type: "TEXT" },
  text: { type: "TEXT" }
} satisfies SchemaMap;

// TypeScript type is automatically inferred from the schema
type Note = SQLiteSchemaInfer<typeof noteSchema>;
```

### Creating and Using a Table with the Inferred TypeScript Type

```typescript
import { createSqliteFactory, SQLiteSchemaInfer } from 'bnkit/sqlite';

const db = new Database("path/to/database");
const { dbTableFactory } = createSqliteFactory({ db });

const notesTable = dbTableFactory({
  schema: noteSchema,
  tableName: "notes",
});

// Using the table with TypeScript type safety
notesTable.create({ id: "1", text: "Note text" });
```

---

## Integrating SQLite with Server Module

You can integrate the SQLite module with the server module for dynamic web applications. For example, use SQLite for storing and retrieving data in server routes:

```typescript
import { serverFactory } from 'bnkit/server';
import { createSqliteFactory } from 'bnkit/sqlite';

const db = new Database("path/to/database");
const { dbTableFactory } = createSqliteFactory({ db });
const notesTable = dbTableFactory({ schema: noteSchema, tableName: "notes" });

const routes = {
  "/notes": {
    GET: async () => {
      const notes = await notesTable.readAll();
      return new Response(JSON.stringify(notes), { headers: { "Content-Type": "application/json" } });
    },
    POST: async (req) => {
      const note = await req.json();
      await notesTable.create(note);
      return new Response("Note created", { status: 201 });
    }
  }
};

const { start } = serverFactory({ routes });
start();
```

### Migrations - Coming Soon

For migrations, consider creating a separate script that reads your current database schema, compares it with the new schema, and executes the necessary ALTER TABLE commands. This script can be run manually or as part of your deployment process.

---

## Summary

The SQLite Module in the Bun Nook Kit empowers developers to build type-safe, SQLite-backed applications with TypeScript. By leveraging TypeScript's type inference, it ensures a seamless and error-free interaction with SQLite databases. This module, when combined with the server module, allows for the creation of robust, data-driven web applications.
