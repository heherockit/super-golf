/**
 * Domain model representing a single recommendation item.
 */
export class RecommendationModel {
  constructor(public text: string) {}
}

export type OnboardingWizardRequest = {
  /**
   * Physical Information card: body metrics and general readiness.
   */
  physicalInformation: {
    /** Height in centimeters. */
    heightCm?: number;

    /** Weight in kilograms. */
    weightKg?: number;

    /** Wrist-to-floor measurement in centimeters. */
    wristToFloorCm?: number;

    /** Glove size. */
    gloveSize?: 'XS' | 'S' | 'M' | 'L' | 'XL';

    /** Age in years. */
    age?: number;

    /** Typical fitness level. */
    fitnessLevel?: 'Low' | 'Moderate' | 'High';

    /** Typical mobility/flexibility level. */
    flexibilityLevel?: 'Low' | 'Moderate' | 'High';
  };

  /**
   * Swing Data & Equipment card: swing metrics and current setup.
   */
  swingDataAndEquipment: {
    /** Driver swing speed in mph. */
    driverSwingSpeedMph?: number;

    /** Driver ball speed in mph. */
    driverBallSpeedMph?: number;

    /** 6-iron swing speed in mph. */
    sixIronSwingSpeedMph?: number;

    /** 6-iron ball speed in mph. */
    sixIronBallSpeedMph?: number;

    /** Typical driver carry distance in yards. */
    driverCarryYds?: number;

    /** Typical 7-iron carry distance in yards. */
    sevenIronCarryYds?: number;

    /** Current clubs brand/model summary. */
    clubsBrandModel?: string;

    /** Current shaft flex. */
    shaftFlex?: 'L' | 'A' | 'R' | 'S' | 'X';

    /** Current shaft material. */
    shaftMaterial?: 'Steel' | 'Graphite';

    /** Grip type. */
    gripType?: 'Cord' | 'Rubber' | 'Wrap';

    /** Grip size. */
    gripSize?: 'Undersize' | 'Standard' | 'Midsize' | 'Jumbo';

    /** Ball brand/model or type. */
    ballBrandModel?: string;

    /** Typical shot shape tendencies. */
    shotShape?: 'Draw' | 'Fade' | 'Straight' | 'Pull' | 'Push' | 'Hook' | 'Slice';

    /** Most common miss pattern. */
    commonMiss?: 'Hook' | 'Slice' | 'Pull' | 'Push' | 'Thin' | 'Fat' | 'Top' | 'Chunk';
  };

  /**
   * Game & Scoring card: current scoring profile and qualitative notes.
   */
  gameAndScoring: {
    /** Current playing handicap index. */
    handicap?: number;

    /** Average 18-hole score. */
    avgScore18?: number;

    /** Best recent round score. */
    bestRecentRound?: number;

    /** Most recent 10 rounds as a comma-separated list (e.g., "95, 92, 90"). */
    lastTenScores?: string;

    /** Biggest strengths in free text. */
    strengths?: string;

    /** Biggest weaknesses in free text. */
    weaknesses?: string;
  };
};
