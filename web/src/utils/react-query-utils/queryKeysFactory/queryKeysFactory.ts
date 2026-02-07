// eslint-disable-next-line @typescript-eslint/ban-types
type QueryKeyFactory = <T extends Record<string, unknown> = {}>(
  key: string,
  factory?: (createKey: KeyFactory) => T
) => FactoryResult<T>;

type KeyFactory = <U extends unknown[]>(...deps: U) => [string, ...U];

type FactoryResult<T extends Record<string, unknown>> = T & {
  default: [string];
};

export const createQueryKeys: QueryKeyFactory = (key, factory) => {
  const createKey: KeyFactory = (...deps) => [key, ...deps];

  return {
    default: [key],
    ...(typeof factory !== 'undefined'
      ? factory(createKey)
      : ({} as ReturnType<NonNullable<typeof factory>>))
  };
};
