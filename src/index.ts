import {Prisma} from '@prisma/client/extension';
import {
  DeletePatterns,
  ModelExtension,
  PrismaUncacheExtensionConfig,
  UNCACHE_OPERATIONS,
  UncacheOptions,
} from './types';

const delP = ({patterns, redis}: DeletePatterns) =>
  patterns.map(
    pattern =>
      new Promise<boolean>(resolve => {
        const stream = redis.scanStream({
          match: pattern,
        });
        stream.on('data', (keys: string[]) => {
          if (keys.length) {
            const pipeline = redis.pipeline();
            pipeline.unlink(keys);
            pipeline.exec();
          }
        });
        stream.on('end', () => resolve(true));
      }),
  );

export default (config: PrismaUncacheExtensionConfig) => {
  const {redis} = config;
  return Prisma.defineExtension({
    name: 'prisma-redis-uncache',
    client: {
      $uncache: {redis},
    },
    model: {
      $allModels: {} as ModelExtension,
    },
    query: {
      $allModels: {
        async $allOperations({operation, args, query}) {
          const useUncache =
            typeof args['uncache'] === 'object' &&
            args['uncache'] !== null &&
            (UNCACHE_OPERATIONS as ReadonlyArray<string>).includes(operation);

          if (!useUncache) return query(args);

          const queryArgs = {
            ...args,
          };
          delete queryArgs['uncache'];
          const {uncacheKeys, hasPattern} = args['uncache'] as unknown as UncacheOptions;

          if (hasPattern) await Promise.all(delP({redis, patterns: uncacheKeys}));
          else redis.unlink(uncacheKeys);

          return query(queryArgs);
        },
      },
    },
  });
};
