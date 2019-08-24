import {
  EntityManager,
  EntityMetadata,
  EntitySchema,
  SaveOptions,
  RemoveOptions,
  ObjectType
} from "typeorm";

export class DistributedEntityManager {
  constructor(private managers: EntityManager[]) {
    if (!managers || managers.length === 0) {
      new Error("Could not initialize DistributedEntityManager");
    }
  }

  save<T>(
    target: ObjectType<T> | EntitySchema<T> | string,
    entity: T,
    options?: SaveOptions
  ): Promise<T> {
    return getManager(this.managers, target).save(entity, options);
  }

  remove<T>(
    target: ObjectType<T> | EntitySchema<T> | string,
    entity: T,
    options?: RemoveOptions
  ): Promise<T> {
    return getManager(this.managers, target).remove(entity, options);
  }
}

function getManager<T>(
  managers: EntityManager[],
  target: ObjectType<T> | EntitySchema<T> | string
): EntityManager {
  const metadata: EntityMetadata[] = managers
    .map(manager => manager.connection.getMetadata(target))
    .filter(metadata => !!metadata);
  if (metadata.length === 0) {
    throw new Error("Failed to load entity metadata");
  }
  return getEntityManager(
    managers,
    metadata[0].connection.name,
    metadata[0].database
  );
}

function getEntityManager(
  managers: EntityManager[],
  connectionName: string = "default",
  dbName?: string
): EntityManager {
  if (dbName) {
    const entityManagers = managers.filter(manager => {
      return manager.connection.options.database === dbName;
    });
    if (entityManagers.length === 0) {
      throw new Error(`Could load connection for database "${dbName}"`);
    }
    return entityManagers[0];
  }

  const entityManagers = managers.filter(manager => {
    return manager.connection.options.name === connectionName;
  });
  if (entityManagers.length === 0) {
    throw new Error(`Could load connection for name "${connectionName}"`);
  }
  return entityManagers[0];
}
