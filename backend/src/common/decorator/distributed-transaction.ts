import { getMetadataArgsStorage } from "typeorm";
import { Container } from "typedi";
import { DistributedEntityManager } from "./distributed-entitity-manager";
import { DistributedTransactionManager } from "./distributed-transaction-manager";

export function DistributedTransaction(): MethodDecorator {
  return function(
    target: Object,
    methodName: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    // save original method - we gonna need it
    const originalMethod = descriptor.value;

    // override method descriptor with proxy method
    descriptor.value = function(...args: any[]) {
      const transactionCallback = (entityManager: DistributedEntityManager) => {
        let argsWithInjectedTransactionManager: any[];

        // filter all @TransactionEntityManager() and @TransactionRepository() decorator usages for this method
        const transactionEntityManagerMetadatas = getMetadataArgsStorage()
          .filterTransactionEntityManagers(
            target.constructor,
            methodName.toString()
          )
          .reverse();

        // if there are @TransactionEntityManager() decorator usages the inject them
        if (transactionEntityManagerMetadatas.length > 0) {
          argsWithInjectedTransactionManager = [...args];
          // replace method params with injection of transactionEntityManager
          transactionEntityManagerMetadatas.forEach((metadata: any) => {
            argsWithInjectedTransactionManager.splice(
              metadata.index,
              0,
              entityManager
            );
          });
        } else {
          argsWithInjectedTransactionManager = [...args];
        }

        return originalMethod.apply(this, argsWithInjectedTransactionManager);
      };
      return Container.get(DistributedTransactionManager).transaction(
        transactionCallback
      );
    };
  };
}
