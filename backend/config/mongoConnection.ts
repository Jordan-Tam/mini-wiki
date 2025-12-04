import {MongoClient} from 'mongodb';
import {mongoConfig} from './settings.ts';

let _connection: any = undefined;
let _database: any = undefined;

const databaseConnection = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(mongoConfig.serverUrl);
        _database = _connection.db(mongoConfig.database);
    }

    return _database;
};

const closeConnection = async () => {
    await _connection.close();
};

export {databaseConnection, closeConnection};