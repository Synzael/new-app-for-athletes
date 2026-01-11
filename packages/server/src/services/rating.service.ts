import { Athlete } from "../entity/Athlete";

interface RatingWeights {
  performance: number; // 40%
  physical: number; // 20%
  academic: number; // 15%
  social: number; // 15%
  evaluation: number; // 10%
}

interface RatingScores {
  performanceScore: number;
  physicalScore: number;
  academicScore: number;
  socialScore: number;
  evaluationScore: number;
}

export interface RatingBreakdown {
  compositeScore: number;
  starRating: number;
  components: {
    performance: { score: number; weight: number; contribution: number };
    physical: { score: number; weight: number; contribution: number };
    academic: { score: number; weight: number; contribution: number };
    social: { score: number; weight: number; contribution: number };
    evaluation: { score: number; weight: number; contribution: number };
  };
  tier: string;
}

export class RatingService {
  private weights: RatingWeights = {
    performance: 0.4, // 40%
    physical: 0.2, // 20%
    academic: 0.15, // 15%
    social: 0.15, // 15%
    evaluation: 0.1, // 10%
  };

  /**
   * Clamp a value between 0 and 100
   */
  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  /**
   * Calculate composite score (0-100) from weighted components
   */
  calculateCompositeScore(scores: RatingScores): number {
    // Clamp all scores to 0-100 range
    const performance = this.clamp(scores.performanceScore);
    const physical = this.clamp(scores.physicalScore);
    const academic = this.clamp(scores.academicScore);
    const social = this.clamp(scores.socialScore);
    const evaluation = this.clamp(scores.evaluationScore);

    const composite =
      performance * this.weights.performance +
      physical * this.weights.physical +
      academic * this.weights.academic +
      social * this.weights.social +
      evaluation * this.weights.evaluation;

    return Math.round(composite * 100) / 100;
  }

  /**
   * Convert composite score (0-100) to star rating (1-5)
   */
  calculateStarRating(compositeScore: number): number {
    if (compositeScore >= 90) return 5.0;
    if (compositeScore >= 80) return 4.5;
    if (compositeScore >= 70) return 4.0;
    if (compositeScore >= 60) return 3.5;
    if (compositeScore >= 50) return 3.0;
    if (compositeScore >= 40) return 2.5;
    if (compositeScore >= 30) return 2.0;
    if (compositeScore >= 20) return 1.5;
    return 1.0;
  }

  /**
   * Get tier label based on star rating
   */
  getTierLabel(starRating: number): string {
    if (starRating === 5.0) return "Elite NIL Prospect";
    if (starRating === 4.5) return "Power 5 Ready";
    if (starRating === 4.0) return "D1 Potential";
    if (starRating === 3.5) return "High D1/Mid-Major";
    if (starRating === 3.0) return "Solid College Athlete";
    if (starRating === 2.5) return "D2/D3 Prospect";
    if (starRating === 2.0) return "Developmental";
    if (starRating === 1.5) return "Emerging Talent";
    return "Early Stage";
  }

  /**
   * Get detailed rating breakdown for an athlete
   */
  getRatingBreakdown(scores: RatingScores): RatingBreakdown {
    const clampedScores = {
      performanceScore: this.clamp(scores.performanceScore),
      physicalScore: this.clamp(scores.physicalScore),
      academicScore: this.clamp(scores.academicScore),
      socialScore: this.clamp(scores.socialScore),
      evaluationScore: this.clamp(scores.evaluationScore),
    };

    const compositeScore = this.calculateCompositeScore(clampedScores);
    const starRating = this.calculateStarRating(compositeScore);

    return {
      compositeScore,
      starRating,
      components: {
        performance: {
          score: clampedScores.performanceScore,
          weight: this.weights.performance * 100,
          contribution:
            clampedScores.performanceScore * this.weights.performance,
        },
        physical: {
          score: clampedScores.physicalScore,
          weight: this.weights.physical * 100,
          contribution: clampedScores.physicalScore * this.weights.physical,
        },
        academic: {
          score: clampedScores.academicScore,
          weight: this.weights.academic * 100,
          contribution: clampedScores.academicScore * this.weights.academic,
        },
        social: {
          score: clampedScores.socialScore,
          weight: this.weights.social * 100,
          contribution: clampedScores.socialScore * this.weights.social,
        },
        evaluation: {
          score: clampedScores.evaluationScore,
          weight: this.weights.evaluation * 100,
          contribution: clampedScores.evaluationScore * this.weights.evaluation,
        },
      },
      tier: this.getTierLabel(starRating),
    };
  }

  /**
   * Update athlete's star rating based on component scores
   */
  async updateAthleteRating(athleteId: string): Promise<Athlete> {
    const athlete = await Athlete.findOne({ where: { id: athleteId } });
    if (!athlete) {
      throw new Error("Athlete not found");
    }

    const compositeScore = this.calculateCompositeScore({
      performanceScore: athlete.performanceScore,
      physicalScore: athlete.physicalScore,
      academicScore: athlete.academicScore,
      socialScore: athlete.socialScore,
      evaluationScore: athlete.evaluationScore,
    });

    athlete.starRating = this.calculateStarRating(compositeScore);
    await athlete.save();

    return athlete;
  }
}

// Export singleton instance
export const ratingService = new RatingService();
