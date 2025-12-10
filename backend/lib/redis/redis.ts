import type { RedisClientType } from "@redis/client";
import { flatten, unflatten } from "flat";
import { createClient } from "redis";
import { RedisConfig } from "../../config/config.ts"
import { is_valid_string, valid_string } from "../validators/validators.ts";

let client : any;

const redis_functions = {

    /**
     * Creates and connects to the Redis server.
     */
    async redis_client(): Promise<any> {

        if (!client) {
            client = await createClient({
                url: RedisConfig.server
            }).on("error", (e) => {
                throw new Error(`Could not connect to redis server: ${RedisConfig.server}`)
            }).connect()
        }

        return client;

    },

    async clear_all() {

        (await this.redis_client()).flushAll();

    },

    async exists_in_cache(key: string): Promise<boolean> {

        let exists = await (await this.redis_client()).exists(key);

        if (exists) {

            console.log(`${key}: Cache hit!`);

            return true;

        }

        console.log(`${key}: Cache miss.`);

        return false;

    },

    async get(key: string) {

        return(await (await this.redis_client()).get(key));

    },

    async set(key: string, value: object) {

        await (await this.redis_client()).set(key, value);

    },

    async del(key: string) {

        await (await this.redis_client()).del(key);

    },

    async get_json(key: string) {

        return(JSON.parse(await (await this.redis_client()).get(key)));

    },

    async set_json(key: string, value: object) {

        await (await this.redis_client()).set(key, JSON.stringify(value));

    },

    async del_json(key: string) {

        await (await this.redis_client()).del(key);

    }

}

export default redis_functions;