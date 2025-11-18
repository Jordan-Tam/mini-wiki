import type { RedisClientType } from "@redis/client";
import { flatten, unflatten } from "flat";
import { createClient } from "redis";
import { RedisConfig } from "../../config/config.ts"
import { is_valid_string, valid_string } from "../validators/validators.ts";

let client:any;

export async function redisClient(): Promise<RedisClientType> {
    if(!client) {
        client = await createClient({
            url: RedisConfig.server
        }).on("error", (e) => {
            throw new Error(`Could not connec to redis server: ${RedisConfig.server}`)
        }).connect()
    }

    return client;
}

export async function clear_all() {
    (await redisClient()).flushAll();
}

/**
 * 
 * @param {string} key 
 * @param {any} value 
 * @param {number | undefined} ex
 * @returns {string | null}
 */
export async function set_value(key:string, value:any, ex?:number) {
    valid_string(key, `key`, undefined, `set_value`);

    const r = await redisClient();

    let res = await r.set(key, value, ex? {
        "expiration": {
            type: "EX",
            value: ex
        }
    } : undefined);

    console.log(`Cache:: set key: ${key}`);

    return res;
}

/**
 * Return boolean if key exists in redis cache
 * @param key 
 * @returns 
 */
export async function has_value(key:string): Promise<boolean> {
    valid_string(key, `key`, undefined, `has_value`);

    const r = await redisClient();

    return (await r.exists(key) !== 0)
}

/**
 * Set_value but with objects
 * @typedef {(key:string, value:any, ex?:number) => Promise<string | null>}
 * @param {string} key 
 * @param {any} value 
 * @param {number | undefined} ex 
 * @returns 
 */
export async function set_value_object(key:string, value:any, ex?:number) {
    const flat = flatten(value);
    return await set_value(key, JSON.stringify(flat), ex);
}

/**
 * @typedef {(key:string) => Promise<string | null>}
 * @param {string} key 
 * @returns {string | null}
 */
export async function get_value(key:string) {
    is_valid_string(key);
    const r = await redisClient();
    return await r.get(key);
}

/**
 * Get_value but with objects
 * @typedef {(key:string) => Promise<any>}
 * @param {string} key 
 * @returns 
 */
export async function get_value_object(key:string): Promise<{[key:string]: any} | null> {
    is_valid_string(key);
    const res = await get_value(key);
    return (res)? unflatten(JSON.parse(res)) : null;
}

export async function get_value_array(key:string): Promise<Array<any> | null> {
    is_valid_string(key);
    let res = await get_value_object(key);

    if(!res) {
        return null;
    }

    // convert objectified array back to array (indexes are converted to object keys in flattening).
    let res_array:Array<any> = [];
    for(const obj_index of Object.keys(res)) {
        const i = parseInt(obj_index);
        if(!Number.isNaN(i)) {
            res_array[i] = res[obj_index];
        } else {
            console.warn(`WARN: Found non-numerical key in array object: ${obj_index} in`, res);
        }
    }

    return res_array;
}

export async function delete_value(key:string) {
    is_valid_string(key);
    const r = await redisClient();
    return await r.del(key);
}

/**
 * @typedef {(key:string, amountby?: number) => Promise<number>}
 * @param {string} key 
 * @param {number | undefined} amountby 
 * @returns {Promise<number>}
 */
export async function increment(key:string, amountby?:number): Promise<number> {
    is_valid_string(key);
    const amount = amountby ?? 1;

    const r = await redisClient();
    return await r.incrBy(key, amount);
}

/**
 * @typedef {(key:string, amountby?:number) => Promise<number>}
 * @param {string} key 
 * @param {number | undefined} amountby 
 * @returns {Promise<number>}
 */
export async function leaderboard_increment(key:string, amountby?:number): Promise<number> {
    is_valid_string(key);
    const amount = amountby ?? 1;

    const r = await redisClient();
    return await r.zIncrBy(RedisConfig.scoreboard, amount, key);
}

//ZREVRANGE blog_scoreboard 0 -1 WITHSCORES
export async function leaderboard_dump() {
    const r = await redisClient();
    let res = await r.zRange(RedisConfig.scoreboard, 0, 9, {REV: true})
    
    // unflatten response
    res = res.map((flattened:any) => {return JSON.parse(unflatten(flattened))});

    // zrange is a much better way to do this but it wouldn't work in node's redis for some reason
    return res;
}