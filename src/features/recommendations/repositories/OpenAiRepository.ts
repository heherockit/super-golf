import OpenAI from 'openai';

/**
 * OpenAiRepository integrates with the official OpenAI SDK (Chat Completions)
 * to generate structured golf recommendations (equipment, game improvements, scoring).
 * Falls back to deterministic local generation when `OPENAI_API_KEY` is absent.
 */
export type WizardPayload = {
  // Body & Physical Info
  heightCm?: number;
  weightKg?: number;
  wristToFloorCm?: number;
  gloveSize?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  age?: number;
  fitnessLevel?: 'Low' | 'Moderate' | 'High';
  flexibilityLevel?: 'Low' | 'Moderate' | 'High';

  // Swing Data & Equipment
  driverSwingSpeedMph?: number;
  driverBallSpeedMph?: number;
  sixIronSwingSpeedMph?: number;
  sixIronBallSpeedMph?: number;
  driverCarryYds?: number;
  sevenIronCarryYds?: number;
  clubsBrandModel?: string;
  shaftFlex?: 'L' | 'A' | 'R' | 'S' | 'X';
  shaftMaterial?: 'Steel' | 'Graphite';
  gripType?: 'Cord' | 'Rubber' | 'Wrap';
  gripSize?: 'Undersize' | 'Standard' | 'Midsize' | 'Jumbo';
  ballBrandModel?: string;
  shotShape?: 'Draw' | 'Fade' | 'Straight' | 'Pull' | 'Push' | 'Hook' | 'Slice';
  commonMiss?: 'Hook' | 'Slice' | 'Pull' | 'Push' | 'Thin' | 'Fat' | 'Top' | 'Chunk';

  // Game & Scoring
  handicap?: number;
  avgScore18?: number;
  bestRecentRound?: number;
  lastTenScores?: string;
  strengths?: string;
  weaknesses?: string;
};

export type StructuredRecommendations = {
  equipment: {
    driver: { head?: string; loft?: string; lie?: string; shaftSteel?: string; shaftGraphite?: string };
    iron: { head?: string; lie?: string; shaftSteel?: string; shaftGraphite?: string };
    wedges: { heads?: string; grind?: string; lie?: string; shaftSteel?: string; shaftGraphite?: string };
    grip: { size?: string; type?: string };
    ball: { type?: string; softness?: string };
    putter: { head?: string; length?: string; lie?: string };
  };
  gameImprovements: {
    plan: { longGame: string[]; shortGame: string[]; putting: string[] };
    extras: { trainingAids: string[]; apps: string[]; enjoymentUpgrades: string[] };
  };
  scoring: {
    handicapCalculation: { estimate: number; method: string; notes: string[] };
  };
};

/**
 * Clamps a number to a safe range.
 */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Computes a simple handicap estimate using average score and typical course rating/slope.
 * Uses Course Rating=72 and Slope=113 as defaults if not provided.
 */
function computeHandicapEstimate(avg?: number): number {
  if (!avg) return 20;

  const courseRating = 72;

  const slope = 113;

  const idx = ((avg - courseRating) * 113) / slope;

  return Math.round(clamp(idx, 0, 54));
}

/**
 * Returns a deterministic fallback recommendations object based on payload.
 */
function fallbackGenerate(payload: WizardPayload): StructuredRecommendations {
  const lastTen = (payload.lastTenScores ?? '')
    .split(',')
    .map((x) => x.trim())
    .map((x) => Number(x))
    .filter((n) => !Number.isNaN(n) && n >= 60 && n <= 150);

  const avg = payload.avgScore18 ?? (lastTen.length ? Math.round(lastTen.reduce((a, b) => a + b, 0) / lastTen.length) : undefined);

  const estimate = computeHandicapEstimate(avg);

  const driverSS = payload.driverSwingSpeedMph ?? 95;

  const graphiteFlex = driverSS >= 105 ? 'X' : driverSS >= 95 ? 'S' : driverSS >= 85 ? 'R' : 'A';

  const steelFlex = payload.shaftFlex ?? graphiteFlex as any;

  return {
    equipment: {
      driver: {
        head: 'Forged titanium head with mid-MOI',
        loft: driverSS >= 105 ? '9–10°' : driverSS >= 95 ? '10–11°' : '11–12°',
        lie: 'Standard',
        shaftSteel: `Not typical (driver). If used: ${steelFlex}`,
        shaftGraphite: `${graphiteFlex} flex, mid-kick, ${payload.shaftMaterial ?? 'Graphite'}`,
      },
      iron: {
        head: (payload.clubsBrandModel ?? 'Cavity-back irons'),
        lie: 'Fit via static/dynamic (use wrist-to-floor)',
        shaftSteel: `${payload.shaftFlex ?? 'R'} flex, mid-weight`,
        shaftGraphite: `${payload.shaftFlex ?? 'R'} flex, low–mid torque`,
      },
      wedges: {
        heads: 'Gap/Sand/Lob with varied bounce',
        grind: 'Match turf interaction and shot style',
        lie: 'Standard; adjust for pull/push tendencies',
        shaftSteel: `${payload.shaftFlex ?? 'R'} flex`,
        shaftGraphite: `${payload.shaftFlex ?? 'R'} flex`,
      },
      grip: {
        size: payload.gripSize ?? 'Standard',
        type: payload.gripType ?? 'Rubber',
      },
      ball: {
        type: payload.ballBrandModel ?? 'Tour or Mid-compression',
        softness: payload.driverBallSpeedMph && payload.driverBallSpeedMph >= 165 ? 'Firm' : 'Medium',
      },
      putter: {
        head: 'Mallet for stability (or blade for feel)',
        length: '33–35 inches, fit by posture',
        lie: 'Standard; adjust for aim bias',
      },
    },
    gameImprovements: {
      plan: {
        longGame: [
          '2×/week swing speed or launch monitor sessions',
          'Driver/6-iron start line and curvature control drills',
          'Course management: layup vs. attack decisions'
        ],
        shortGame: [
          'Wedge ladder drills (carry/roll control)',
          'Bunker entry and exit technique (bounce usage)',
          'Up-and-down challenge sets (varied lies)'
        ],
        putting: [
          'Gate drill for start line',
          'Tempo metronome sessions (32–36 bpm typical)',
          'Lag putting distances and green reading practice'
        ],
      },
      extras: {
        trainingAids: ['Swing speed trainer', 'Putting mirror', 'Alignment sticks'],
        apps: ['Arccos', 'GolfShot', 'V1 Golf'],
        enjoymentUpgrades: ['Music-ready cart speaker', 'Comfort grip upgrade', 'Course photography goals'],
      },
    },
    scoring: {
      handicapCalculation: {
        estimate,
        method: 'Average score based estimate (CR=72, Slope=113)',
        notes: [
          'For official index, post scores and use course/slope specific differentials',
          'Use best differentials from recent rounds per WHS rules'
        ],
      },
    },
  };
}

/**
 * Repository calling OpenAI chat API to produce structured recommendations.
 */
export class OpenAiRepository {
  /**
   * Constructs the repository with the provided API key. When the key is present,
   * an OpenAI client is initialized; otherwise, calls will use the deterministic fallback.
   */
  constructor(private apiKey: string | undefined = process.env.OPENAI_API_KEY) {}

  /** OpenAI SDK client instance (initialized lazily). */
  private client: OpenAI | null = null;

  /**
   * Returns an initialized OpenAI client if the API key is available; otherwise null.
   */
  private getClient(): OpenAI | null {
    if (!this.apiKey) return null;

    if (!this.client) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }

    return this.client;
  }

  /**
   * Generates structured recommendations from the wizard payload. If the API key
   * is missing or the response is invalid, produces a deterministic fallback.
   */
  async generate(payload: WizardPayload): Promise<StructuredRecommendations> {
    const client = this.getClient();

    if (!client) return fallbackGenerate(payload);

    let contextContent = '';

    for (const key in payload) {
        contextContent += `${key}: ${payload[key as keyof WizardPayload]}\n`;
    }

    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-5-mini',
        response_format: { 
          type: 'json_schema',
          json_schema: {
            "name": "golf_recommendation",
            "schema": {
              "type": "object",
              "properties": {
                "equipment": {
                  "type": "object",
                  "properties": {
                    "driver": {
                      "type": "object",
                      "properties": {
                        "head": { "type": "string" },
                        "loft": { "type": "string" },
                        "lie": { "type": "string" },
                        "shaftSteel": { "type": "string" },
                        "shaftGraphite": { "type": "string" }
                      },
                      "required": ["head", "loft", "lie", "shaftSteel", "shaftGraphite"]
                    },
                    "iron": {
                      "type": "object",
                      "properties": {
                        "head": { "type": "string" },
                        "lie": { "type": "string" },
                        "shaftSteel": { "type": "string" },
                        "shaftGraphite": { "type": "string" }
                      },
                      "required": ["head", "lie", "shaftSteel", "shaftGraphite"]
                    },
                    "wedges": {
                      "type": "object",
                      "properties": {
                        "heads": { "type": "string" },
                        "grind": { "type": "string" },
                        "lie": { "type": "string" },
                        "shaftSteel": { "type": "string" },
                        "shaftGraphite": { "type": "string" }
                      },
                      "required": ["heads", "grind", "lie", "shaftSteel", "shaftGraphite"]
                    },
                    "grip": {
                      "type": "object",
                      "properties": {
                        "size": { "type": "string" },
                        "type": { "type": "string" }
                      },
                      "required": ["size", "type"]
                    },
                    "ball": {
                      "type": "object",
                      "properties": {
                        "type": { "type": "string" },
                        "softness": { "type": "string", "enum": ["Firm", "Medium", "Soft"] }
                      },
                      "required": ["type", "softness"]
                    },
                    "putter": {
                      "type": "object",
                      "properties": {
                        "head": { "type": "string" },
                        "length": { "type": "string" },
                        "lie": { "type": "string" }
                      },
                      "required": ["head", "length", "lie"]
                    }
                  },
                  "required": ["driver", "iron", "wedges", "grip", "ball", "putter"]
                },
                "gameImprovements": {
                  "type": "object",
                  "properties": {
                    "plan": {
                      "type": "object",
                      "properties": {
                        "longGame": {
                          "type": "array",
                          "items": { "type": "string" }
                        },
                        "shortGame": {
                          "type": "array",
                          "items": { "type": "string" }
                        },
                        "putting": {
                          "type": "array",
                          "items": { "type": "string" }
                        }
                      },
                      "required": ["longGame", "shortGame", "putting"]
                    },
                    "extras": {
                      "type": "object",
                      "properties": {
                        "trainingAids": {
                          "type": "array",
                          "items": { "type": "string" }
                        },
                        "apps": {
                          "type": "array",
                          "items": { "type": "string" }
                        },
                        "enjoymentUpgrades": {
                          "type": "array",
                          "items": { "type": "string" }
                        }
                      },
                      "required": ["trainingAids", "apps", "enjoymentUpgrades"]
                    }
                  },
                  "required": ["plan", "extras"]
                },
                "scoring": {
                  "type": "object",
                  "properties": {
                    "handicapCalculation": {
                      "type": "object",
                      "properties": {
                        "estimate": {},
                        "method": { "type": "string" },
                        "notes": {
                          "type": "array",
                          "items": { "type": "string" }
                        }
                      },
                      "required": ["method", "notes"]
                    }
                  },
                  "required": ["handicapCalculation"]
                }
              },
              "required": ["equipment", "gameImprovements", "scoring"],
              "additionalProperties": false
            }
          }
         },
        messages: [
          {
            role: 'system',
            content:
              `You are a golf fitting and coaching assistant.
              You provide detailed equipment specs, game improvements, a 3-part practice plan with aids/apps/enjoyment upgrades, scoring and handicap calculation.`,
          },
          {
            role: 'assistant',
            content: `CONTEXT DATA:
            User information:
            ${contextContent}`,
          },
          {
            role: 'user',
            content: 'Generate equipment specs, game improvements, a 3-part practice plan with aids/apps/enjoyment upgrades, scoring and handicap calculation.',
          },
        ],
      });

      const content = completion?.choices?.[0]?.message?.content ?? '';

      console.log('OpenAI response:', content);

      const parsed = JSON.parse(content);

      // Basic validation of shape; otherwise fallback
      if (!parsed?.equipment || !parsed?.gameImprovements || !parsed?.scoring) {
        return fallbackGenerate(payload);
      }

      return parsed as StructuredRecommendations;
    } catch {
      return fallbackGenerate(payload);
    }
  }
}