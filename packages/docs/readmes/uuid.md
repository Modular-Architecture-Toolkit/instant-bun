# UUID Module

## Introduction

The UUID Module in the Bun Nook Kit provides a set of utilities for generating, manipulating, and validating UUIDs (Universally Unique Identifiers), particularly for versions 6, 7, and 8. This module is designed to support various UUID operations needed in modern web and server applications, ensuring unique identifiers are generated and handled correctly.

## Features

### UUID Generation

- **Version 6 (Date-time and Clock Sequence UUID)**: Generates time-based UUIDs with a high degree of uniqueness.
- **Version 7 (Epoch-based Timestamp UUID)**: Provides UUIDs based on Unix Epoch timestamps.
- **Version 8 (Custom UUID)**: Allows for the creation of UUIDs with custom data elements.

### UUID Components Extraction and Formatting

- Methods to extract and format different parts of UUIDs, such as timestamps, node, and clock sequence values.

### UUID Validation and Conversion

- **Validation**: Checks if a given string is a valid UUID.
- **Conversion**: Functions to convert UUIDs to dates and extract specific data.

## Usage Examples

### Generating Different Versions of UUIDs

```javascript
import { generateUuid, generateUuidV6, generateUuidV7, generateUuidV8 } from 'bnkit/uuid';

const uuidV6 = generateUuidV6();
const uuidV7 = generateUuidV7();
const uuidV8 = generateUuidV8([BigInt(0x123456789abc), BigInt(0x123), BigInt(0x3fffffffffffffff)]);
```

### Validating UUIDs

```javascript
import { isValidUuid } from 'bnkit/uuid';

const valid = isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479');
```

### Extracting Timestamp from UUID v7

```javascript
import { extractTimestampFromUuidV7 } from 'bnkit/uuid';

const { timestamp } = extractTimestampFromUuidV7('01e501f3-9f9b-7f3a-b473-2c8c4d43a3f4');
```


## [UUID Usage](usage/uuid-usage.md)
