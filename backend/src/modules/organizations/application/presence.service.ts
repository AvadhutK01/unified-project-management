import { env } from "../../../config/env.js";
import { Redis } from "ioredis";

let redisClient: Redis | null = null;

/**
 * Initializes a Redis client using ioredis.
 */
const getRedisClient = (): Redis => {
    if (!redisClient) {
        redisClient = new Redis(env.REDIS_URL);
    }
    return redisClient;
};

/**
 * Updates a user's presence status in Redis for an organization.
 */
export const setUserPresence = async (
    orgId: string,
    memberId: string,
    status: "active" | "away" | "onleave" | "offline",
) => {
    const client = getRedisClient();
    const key = `presence:org:${orgId}`;
    await client.hset(key, memberId, status);
};

/**
 * Removes a user's presence status from Redis.
 */
export const removeUserPresence = async (orgId: string, memberId: string) => {
    const client = getRedisClient();
    const key = `presence:org:${orgId}`;
    await client.hdel(key, memberId);
};

/**
 * Retrieves the full presence map for an organization from Redis.
 */
export const getOrgPresence = async (
    orgId: string,
): Promise<Record<string, string>> => {
    const client = getRedisClient();
    const key = `presence:org:${orgId}`;
    return client.hgetall(key);
};

/**
 * Broadcasts a presence status update to all connected sockets in an organization room.
 */
export const broadcastPresenceUpdate = async (
    orgId: string,
    memberId: string,
    status: "active" | "away" | "onleave" | "offline",
) => {
    await setUserPresence(orgId, memberId, status);
    try {
        const { getSocketServer } = await import("../../../app/socket.js");
        const io = getSocketServer();
        const roomName = `org:${orgId}`;
        io.of("/socket.io").to(roomName).emit("presence:update", {
            memberId,
            status,
        });
    } catch {
        //
    }
};
