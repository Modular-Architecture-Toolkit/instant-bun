# SQLite Module

## Introduction

The SQLite Module in the Bun Nook Kit is a powerful tool designed to leverage SQLite databases in TypeScript applications. Its primary feature is the generation of TypeScript types directly from SQLite schema definitions, ensuring type safety and consistency between your database schema and TypeScript code.

## Key Features

### TypeScript-Inferred SQLite Schemas

- **Schema-to-Type Translation**: Automatically translates SQLite table schemas into TypeScript types.
- **Type Safety in SQLite Operations**: Ensures type-safe interactions with SQLite databases by aligning TypeScript types with SQLite schemas.

### SQLite Table Factory

- **Dynamic Table Creation**: Allows for the creation of SQLite tables with custom schemas.
- **CRUD Operation Utilities**: Provides utilities for common database operations like Create, Read, Update, and Delete.

### Debugging and Foreign Key Support

- **Debugging Options**: Includes debug flags for logging and troubleshooting.
- **Foreign Key Management**: Offers options to handle foreign keys within SQLite tables.

## Usage Examples

### Defining a SQLite Schema and Corresponding TypeScript Type

```typescript
import { SchemaMap } from 'bnkit/sqlite/sqlite-factory';

const noteSchema = {
  id: { type: "TEXT" },
  text: { type: "TEXT" },
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

### [SQLite Usage Docs](usage/sqlite-usage.md)

