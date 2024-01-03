import {Operation} from '@prisma/client/runtime/library';
import {Prisma} from '@prisma/client/extension';
import {Redis} from 'ioredis';

export const REQUIRED_ARGS_OPERATIONS = [
  'delete',
  'findUnique',
  'findUniqueOrThrow',
  'groupBy',
  'update',
  'upsert',
] as const satisfies ReadonlyArray<Operation>;
export const OPTIONAL_ARGS_OPERATIONS = [
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
] as const satisfies ReadonlyArray<Operation>;

export const UNCACHE_OPERATIONS = [...REQUIRED_ARGS_OPERATIONS, ...OPTIONAL_ARGS_OPERATIONS] as const;

type RequiredArgsOperation = (typeof REQUIRED_ARGS_OPERATIONS)[number];
type OptionalArgsOperation = (typeof OPTIONAL_ARGS_OPERATIONS)[number];

export type UncacheOperation = RequiredArgsOperation | OptionalArgsOperation;

type RequiredArgsFunction<O extends RequiredArgsOperation> = <T, A>(
  this: T,
  args: Prisma.Exact<A, Prisma.Args<T, O> & PrismaUncacheArgs>,
) => Promise<Prisma.Result<T, A, O>>;

type OptionalArgsFunction<O extends OptionalArgsOperation> = <T, A>(
  this: T,
  args?: Prisma.Exact<A, Prisma.Args<T, O> & PrismaUncacheArgs>,
) => Promise<Prisma.Result<T, A, O>>;

export type ModelExtension = {
  [O1 in RequiredArgsOperation]: RequiredArgsFunction<O1>;
} & {
  [O2 in OptionalArgsOperation]: OptionalArgsFunction<O2>;
};

export interface UncacheOptions {
  /**
   * Uncache keys
   */
  uncacheKeys: string[];
  /**
   * Pattern in keys?
   */
  hasPattern?: boolean;
}

export interface PrismaUncacheArgs {
  uncache?: UncacheOptions;
}

export type KeyGeneratorArgs = {
  model: string;
  operation: string;
  args: unknown;
};

export type DeletePatterns = {
  redis: Redis;
  patterns: string[];
};

export interface PrismaUncacheExtensionConfig {
  redis: Redis;
}
