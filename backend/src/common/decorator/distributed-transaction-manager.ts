import { DistributedEntityManager } from "./distributed-entitity-manager";
import { Service } from "typedi";
import { ConnectionManager, EntityManager } from "typeorm";
import { QueryRunnerProviderAlreadyReleasedError } from "typeorm/error/QueryRunnerProviderAlreadyReleasedError";

@Service()
export class DistributedTransactionManager {
  private managers: EntityManager[];

  constructor(connectionManager: ConnectionManager) {
    this.managers = connectionManager.connections.map(
      connection => connection.manager
    );
  }

  async transaction<T>(
    runInTransaction: (entityManager: DistributedEntityManager) => Promise<T>
  ): Promise<T> {
    if (!runInTransaction) {
      throw new Error(`Transaction method missing.`);
    }

    this.managers.forEach(manager => {
      /*      if (manager.connection.driver instanceof MongoDriver) {
        throw new Error(`Transactions aren't supported by MongoDB.`);
      }*/
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
      await Promise.all(
        queryRunners.map(async queryRunner => {
          return await queryRunner.startTransaction();
        })
      );
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
          // if we used a new query runner provider then release it
          await queryRunner.release();
        })
      );
    }
  }
}
