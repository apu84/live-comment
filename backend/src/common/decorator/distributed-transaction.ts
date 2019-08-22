import { getMetadataArgsStorage, EntityManager } from "typeorm";
import { Container } from "typedi";
import {
  DistributedEntityManager,
  IsolationLevel
} from "./distributed-entitity-manager";

export interface TransactionOptions {
  connectionName?: string;
  isolation?: IsolationLevel;
}

export function DistributedTransaction(
  connectionOrOptions?: string | TransactionOptions
): MethodDecorator {
  return function(
    target: Object,
    methodName: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    // save original method - we gonna need it
    const originalMethod = descriptor.value;

    // override method descriptor with proxy method
    descriptor.value = function(...args: any[]) {
      let connectionName = "default";
      let isolationLevel: IsolationLevel | undefined = undefined;
      if (connectionOrOptions) {
        if (typeof connectionOrOptions === "string") {
          connectionName = connectionOrOptions;
        } else {
          if (connectionOrOptions.connectionName) {
            connectionName = connectionOrOptions.connectionName;
          }
          if (connectionOrOptions.isolation) {
            isolationLevel = connectionOrOptions.isolation;
          }
        }
      }

      console.log("** connectionName ** ", connectionName);

      const transactionCallback = (entityManager: EntityManager) => {
        let argsWithInjectedTransactionManagerAndRepositories: any[];

        // filter all @TransactionEntityManager() and @TransactionRepository() decorator usages for this method
        const transactionEntityManagerMetadatas = getMetadataArgsStorage()
          .filterTransactionEntityManagers(
            target.constructor,
            methodName.toString()
          )
          .reverse();
        const transactionRepositoryMetadatas = getMetadataArgsStorage()
          .filterTransactionRepository(
            target.constructor,
            methodName.toString()
          )
          .reverse();

        // if there are @TransactionEntityManager() decorator usages the inject them
        if (transactionEntityManagerMetadatas.length > 0) {
          argsWithInjectedTransactionManagerAndRepositories = [...args];
          // replace method params with injection of transactionEntityManager
          transactionEntityManagerMetadatas.forEach((metadata: any) => {
            argsWithInjectedTransactionManagerAndRepositories.splice(
              metadata.index,
              0,
              entityManager
            );
          });
        } else if (transactionRepositoryMetadatas.length === 0) {
          // otherwise if there's no transaction repositories in use, inject it as a first parameter
          argsWithInjectedTransactionManagerAndRepositories = [
            entityManager,
            ...args
          ];
        } else {
          argsWithInjectedTransactionManagerAndRepositories = [...args];
        }

        return originalMethod.apply(
          this,
          argsWithInjectedTransactionManagerAndRepositories
        );
      };
      if (isolationLevel) {
        return Container.get(DistributedEntityManager).transaction(
          isolationLevel,
          transactionCallback
        );
      } else {
        return Container.get(DistributedEntityManager).transaction(
          transactionCallback
        );
      }
    };
  };
}
