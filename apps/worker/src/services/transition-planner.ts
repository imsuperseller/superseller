/**
 * Transition Planner — Determines seamless vs dissolve transitions per clip boundary.
 *
 * Uses floorplan adjacency data (connects_to) to decide:
 * - Adjacent rooms → seamless concat (no transition, walkthrough feel)
 * - Floor changes / distant rooms → dissolve crossfade (0.3s)
 *
 * When no floorplan data: defaults to seamless (better than always dissolve).
 */

import { FloorplanAnalysis } from "../types";
import { logger } from "../utils/logger";

export type TransitionType = "seamless" | "dissolve";

export interface TransitionMap {
    /** transitions[i] = type for boundary between clip i and clip i+1 */
    transitions: TransitionType[];
    /** Summary for logging */
    summary: { seamless: number; dissolve: number };
}

/**
 * Build a transition map for clip boundaries based on room adjacency.
 *
 * @param clips - Ordered clips with from_room / to_room
 * @param floorplanAnalysis - Floorplan data with rooms[].connects_to and floor info
 * @returns TransitionMap with per-boundary decisions
 */
export function buildTransitionMap(
    clips: Array<{ clip_number: number; from_room?: string; to_room?: string }>,
    floorplanAnalysis?: FloorplanAnalysis | null
): TransitionMap {
    if (clips.length <= 1) {
        return { transitions: [], summary: { seamless: 0, dissolve: 0 } };
    }

    // Build adjacency map from floorplan rooms (case-insensitive)
    const adjacencyMap = new Map<string, Set<string>>();
    const floorMap = new Map<string, number>();

    if (floorplanAnalysis?.rooms) {
        for (const room of floorplanAnalysis.rooms) {
            const key = room.name.toLowerCase();
            const connections = new Set((room.connects_to || []).map((c) => c.toLowerCase()));
            adjacencyMap.set(key, connections);
            if (room.floor != null) {
                floorMap.set(key, room.floor);
            }
        }
    }

    const transitions: TransitionType[] = [];
    let seamlessCount = 0;
    let dissolveCount = 0;

    for (let i = 0; i < clips.length - 1; i++) {
        const currentRoom = (clips[i].to_room || "").toLowerCase();
        const nextRoom = (clips[i + 1].to_room || "").toLowerCase();

        const decision = decideTransition(currentRoom, nextRoom, adjacencyMap, floorMap);
        transitions.push(decision);

        if (decision === "seamless") seamlessCount++;
        else dissolveCount++;
    }

    const summary = { seamless: seamlessCount, dissolve: dissolveCount };
    logger.info({
        msg: "Transition map built",
        total: transitions.length,
        ...summary,
        hasFloorplan: !!floorplanAnalysis?.rooms?.length,
    });

    return { transitions, summary };
}

/**
 * Decide transition type for a single boundary between two rooms.
 */
function decideTransition(
    currentRoom: string,
    nextRoom: string,
    adjacencyMap: Map<string, Set<string>>,
    floorMap: Map<string, number>
): TransitionType {
    // If either room name is empty/unknown, default seamless
    if (!currentRoom || !nextRoom) return "seamless";

    // Exterior transitions always get dissolve (entering/leaving house)
    const isExteriorTransition =
        (currentRoom.includes("exterior") || currentRoom.includes("backyard") || currentRoom.includes("pool")) !==
        (nextRoom.includes("exterior") || nextRoom.includes("backyard") || nextRoom.includes("pool"));
    // Specifically: going from interior to exterior or vice versa
    if (isExteriorTransition) {
        // Exception: front door → foyer is a seamless walk-in
        if (
            (currentRoom.includes("front door") && (nextRoom.includes("foyer") || nextRoom.includes("entry"))) ||
            (nextRoom.includes("front door") && (currentRoom.includes("foyer") || currentRoom.includes("entry")))
        ) {
            return "seamless";
        }
        // Exception: exterior front → front door is the approach walk
        if (currentRoom.includes("exterior") && nextRoom.includes("front door")) {
            return "seamless";
        }
        return "dissolve";
    }

    // Floor changes always get dissolve
    const currentFloor = floorMap.get(currentRoom);
    const nextFloor = floorMap.get(nextRoom);
    if (currentFloor != null && nextFloor != null && currentFloor !== nextFloor) {
        return "dissolve";
    }

    // Stairs transitions get dissolve
    if (currentRoom.includes("stair") || nextRoom.includes("stair")) {
        return "dissolve";
    }

    // No floorplan adjacency data → default seamless (better than always dissolve)
    if (adjacencyMap.size === 0) {
        return "seamless";
    }

    // Check direct adjacency
    const currentConnections = adjacencyMap.get(currentRoom);
    if (currentConnections && currentConnections.has(nextRoom)) {
        return "seamless";
    }

    // Check reverse adjacency (connects_to may not be bidirectional in the data)
    const nextConnections = adjacencyMap.get(nextRoom);
    if (nextConnections && nextConnections.has(currentRoom)) {
        return "seamless";
    }

    // Check if connected via a common intermediate (hallway, foyer)
    if (currentConnections) {
        for (const [roomName, conns] of adjacencyMap) {
            if (currentConnections.has(roomName) && conns.has(nextRoom)) {
                return "seamless"; // Connected via intermediate room
            }
        }
    }

    // Rooms not connected in floorplan → dissolve (teleportation)
    logger.debug({
        msg: "Transition: dissolve (rooms not adjacent)",
        from: currentRoom,
        to: nextRoom,
    });
    return "dissolve";
}

/**
 * Get the xfade duration for a specific boundary.
 * Seamless = 0 (no overlap), dissolve = 0.3s.
 */
export function getXfadeDuration(transitionType: TransitionType): number {
    return transitionType === "dissolve" ? 0.3 : 0;
}
