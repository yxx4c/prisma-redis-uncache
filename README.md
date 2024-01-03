
# prisma-redis-uncache

The [prisma-redis-uncache](https://github.com/yxx4c/prisma-redis-uncache)  library complements the [prisma-redis-cache](https://github.com/yxx4c/prisma-redis-cache) library by providing a straightforward solution for selectively invalidating cached Prisma query results in a Redis/Dragonfly database. This library is essential for scenarios where real-time data updates or changes in the application's state require immediate cache invalidation to maintain data integrity.

### **Installation**

##### **Using npm:**

```bash
npm install @yxx4c/prisma-redis-uncache
```

##### **Using yarn:**

```bash
yarn add @yxx4c/prisma-redis-uncache
```

##### **Using pnpm:**

```bash
pnpm add @yxx4c/prisma-redis-uncache
```

##### **Using bun:**

```bash
bun add @yxx4c/prisma-redis-uncache
```

### Example

```javascript
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import prismaUncache from '@yxx4c/prisma-redis-uncache';

// Create a Redis client
const redis = new Redis({
  host: env.REDIS_HOST_NAME,
  port: env.REDIS_PORT,
});

// Create a Prisma client instance
const prisma = new PrismaClient();

// Extend Prisma with the cache invalidation functionality provided by prisma-redis-uncache
const prismaWithUncache = prisma.$extends(prismaUncache({ redis }));

// Example: Update a user and invalidate related cache keys
prismaWithUncache.user.update({
  where: { id },
  data: { username },
  uncache: {
    uncacheKeys: [`user:${id}`, `user:${id}:post:*`], // Keys to be invalidated
    hasPattern: true, // Use wildcard pattern for key matching
  },
});
```

### Dependencies

- `ioredis`

### Key Features

- **Selective Cache Invalidation:** Easily uncache specific Prisma queries to ensure accurate and up-to-date data retrieval.
- **Flexible Invalidation Strategies:** Create various cache invalidation strategies to suit your application's needs.
- **Programmatic Control:** Integrate cache invalidation logic directly into your application code, offering fine-grained control over when and how cached data is invalidated.

With `prisma-redis-uncache`, you can maintain the balance between performance optimization and data accuracy, ensuring that your application operates seamlessly even in dynamic environments with frequently changing data.
