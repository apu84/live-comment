import { EntityManager, EntityMetadata } from "typeorm";
import { QueryRunnerProviderAlreadyReleasedError } from "typeorm/error/QueryRunnerProviderAlreadyReleasedError";
import { MongoDriver } from "typeorm/driver/mongodb/MongoDriver";

export type IsolationLevel = "READ UNCOMMITTED" | "READ COMMITTED" | "REPEATABLE READ" | "SERIALIZABLE";
export class DistributedEntityManager extends EntityManager {
  constructor(private managers: EntityManager[]) {
    super(managers[0].connection);
  }

  async transaction<T>(
    isolationOrRunInTransaction: IsolationLevel | ((entityManager: EntityManager) => Promise<T>),
    runInTransactionParam?: (entityManager: EntityManager) => Promise<T>
  ): Promise<T> {
    const isolation =
      typeof isolationOrRunInTransaction === "string"
        ? isolationOrRunInTransaction
        : undefined;
    const runInTransaction =
      typeof isolationOrRunInTransaction === "function"
        ? isolationOrRunInTransaction
        : runInTransactionParam;

    if (!runInTransaction) {
      throw new Error(
        `Transaction method requires callback in second paramter if isolation level is supplied.`
      );
    }

    this.managers.forEach(manager => {
      if (manager.connection.driver instanceof MongoDriver) {
        throw new Error(`Transactions aren't supported by MongoDB.`);
      }
      if (manager.queryRunner && manager.queryRunner.isReleased) {
        throw new QueryRunnerProviderAlreadyReleasedError();
      }

      if (manager.queryRunner && manager.queryRunner.isTransactionActive) {
        throw new Error(`Cannot start transaction because its already started`);
      }
    });
    // if query runner is already defined in this class, it means this entity manager was already created for a single connection
    // if its not defined we create a new query runner - single connection where we'll execute all our operations
    const queryRunners = this.managers.map(manager =>
      manager.queryRunner
        ? manager.queryRunner
        : manager.connection.createQueryRunner("master")
    );

    try {
      if (isolation) {
        await Promise.all(
          queryRunners.map(async queryRunner => {
            return await queryRunner.startTransaction(isolation);
          })
        );
      } else {
        await Promise.all(
          queryRunners.map(async queryRunner => {
            return await queryRunner.startTransaction();
          })
        );
      }
      const result = await runInTransaction(
        new DistributedEntityManager(
          queryRunners.map(queryRunner => queryRunner.manager)
        )
      );
      await Promise.all(
        queryRunners.map(async queryRunner => {
          return await queryRunner.commitTransaction();
        })
      );
      return result;
    } catch (err) {
      console.log(err);
      try {
        // we throw original error even if rollback thrown an error
        await Promise.all(
          queryRunners.map(async queryRunner => {
            return await queryRunner.rollbackTransaction();
          })
        );
      } catch (rollbackError) {}
      throw err;
    } finally {
      await Promise.all(
        queryRunners.map(async queryRunner => {
          if (!this.queryRunner) {
            // if we used a new query runner provider then release it
            await queryRunner.release();
          }
        })
      );
    }
  }

  saveEntity<T>(target: Function, entity: T): Promise<T> {
    const metadata: EntityMetadata[] = this.managers
      .map(manager => manager.connection.getMetadata(target))
      .filter(metadata => !!metadata);
    if (metadata.length === 0) {
      throw new Error("Failed to load entity metadata");
    }
    return this.getEntityManager(
      metadata[0].connection.name,
      metadata[0].database
    ).save(entity);
  }

  private getEntityManager(
    connectionName: string = "default",
    dbName?: string
  ): EntityManager {
    if (dbName) {
      const targetDbManagers = this.managers.filter(manager => {
        return manager.connection.options.database === dbName;
      });
      if (targetDbManagers.length === 0) {
        throw new Error(`Could load connection for database "${dbName}"`);
      }
      return targetDbManagers[0];
    }

    const targetDbManagers = this.managers.filter(manager => {
      return manager.connection.options.name === connectionName;
    });
    if (targetDbManagers.length === 0) {
      throw new Error(`Could load connection for name "${connectionName}"`);
    }
    return targetDbManagers[0];
  }
}
