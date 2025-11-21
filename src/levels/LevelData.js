// Level Data Structure and Definitions

/**
 * Represents a single phase of a level.
 * @typedef {Object} Phase
 * @property {string} name - Name of the phase (e.g., "Intro", "Chorus")
 * @property {number} beatsPerMeasure - Time signature (e.g., 4 for 4/4)
 * @property {number} jumpBeat - The beat index (0-based) where the Jump Guide (Green) appears
 * @property {number} obstacleBeat - The beat index (0-based) where the Obstacle appears
 * @property {number} duration - Duration of this phase in measures
 * @property {number[][]} rhythmPatterns - Array of allowed rhythm patterns (arrays of beat offsets)
 */

/**
 * Represents a complete game level.
 * @typedef {Object} Level
 * @property {string} name - Display name of the level
 * @property {number} bpm - Beats per minute
 * @property {Phase[]} phases - Sequence of phases
 */

export const TutorialLevel = {
    name: "TUTORIAL",
    bpm: 120,
    phases: [
        {
            name: "BASIC RHYTHM (4/4)",
            beatsPerMeasure: 4,
            jumpBeat: 2, // 3rd beat
            obstacleBeat: 3, // 4th beat
            duration: 32, // Long enough for practice
            rhythmPatterns: [
                [0, 1, 2],       // Simple: Tan, Tan, Tan
                [0, 1, 1.5, 2],  // Variation: Tan, Tan, Ta-Ta
                [0, 0.5, 1, 1.5, 2], // Dense: Ta-Ta, Ta-Ta, Tan
            ]
        }
    ]
};

// Placeholder for the Main Game (Mixed Meter)
export const MainLevel = {
    name: "MAIN GAME",
    bpm: 120,
    phases: [
        {
            name: "PHASE 1 (4/4)",
            beatsPerMeasure: 4,
            jumpBeat: 2,
            obstacleBeat: 3,
            duration: 16,
            rhythmPatterns: [[0, 1, 2], [0, 1, 1.5, 2]]
        },
        {
            name: "PHASE 2 (3/4)",
            beatsPerMeasure: 3,
            jumpBeat: 1,
            obstacleBeat: 2,
            duration: 16,
            rhythmPatterns: [[0, 1], [0, 0.5, 1]]
        },
        {
            name: "PHASE 3 (2/4)",
            beatsPerMeasure: 2,
            jumpBeat: 0,
            obstacleBeat: 1,
            duration: 32,
            rhythmPatterns: [[0], [0, 0.5]]
        }
    ]
};
