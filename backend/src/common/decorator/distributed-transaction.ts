import {getConnection, getMetadataArgsStorage} from "typeorm";

const connectionNames = ['default', 'test'];

export function DistributedTransaction(): MethodDecorator {
  return function (target: Object, methodName: string | symbol, descriptor: PropertyDescriptor) {
    const transactionEntityManagerMetadatas = getMetadataArgsStorage()
        .filterTransactionEntityManagers(target.constructor, methodName.toString())
        .reverse();
    const transactionRepositoryMetadatas = getMetadataArgsStorage()
        .filterTransactionRepository(target.constructor, methodName.toString())
        .reverse();

    console.log(transactionEntityManagerMetadatas);
    console.log(transactionRepositoryMetadatas);

    console.log(descriptor.value);
    const connections = [];
    connectionNames.forEach((connectionName) => {
      connections.push(getConnection(connectionName));
    });
  };
}