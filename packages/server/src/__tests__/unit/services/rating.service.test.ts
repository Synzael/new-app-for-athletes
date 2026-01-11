import { RatingService } from "../../../services/rating.service";

describe("RatingService", () => {
  let ratingService: RatingService;

  beforeEach(() => {
    ratingService = new RatingService();
  });

  describe("calculateCompositeScore", () => {
    it("calculates weighted average correctly with equal weights approach", () => {
      const score = ratingService.calculateCompositeScore({
        performanceScore: 80,
        physicalScore: 90,
        academicScore: 70,
        socialScore: 85,
        evaluationScore: 75,
      });

      // Expected: (80*0.4) + (90*0.2) + (70*0.15) + (85*0.15) + (75*0.1)
      // = 32 + 18 + 10.5 + 12.75 + 7.5 = 80.75
      expect(score).toBe(80.75);
    });

    it("calculates correctly with all scores at 100", () => {
      const score = ratingService.calculateCompositeScore({
        performanceScore: 100,
        physicalScore: 100,
        academicScore: 100,
        socialScore: 100,
        evaluationScore: 100,
      });

      expect(score).toBe(100);
    });

    it("calculates correctly with all scores at 0", () => {
      const score = ratingService.calculateCompositeScore({
        performanceScore: 0,
        physicalScore: 0,
        academicScore: 0,
        socialScore: 0,
        evaluationScore: 0,
      });

      expect(score).toBe(0);
    });

    it("clamps scores above 100 to 100", () => {
      const score = ratingService.calculateCompositeScore({
        performanceScore: 150,
        physicalScore: 200,
        academicScore: 120,
        socialScore: 110,
        evaluationScore: 180,
      });

      expect(score).toBe(100);
    });

    it("clamps negative scores to 0", () => {
      const score = ratingService.calculateCompositeScore({
        performanceScore: -10,
        physicalScore: -20,
        academicScore: -5,
        socialScore: -15,
        evaluationScore: -8,
      });

      expect(score).toBe(0);
    });

    it("handles mixed valid and invalid scores", () => {
      const score = ratingService.calculateCompositeScore({
        performanceScore: 150, // clamped to 100
        physicalScore: 50, // valid
        academicScore: -10, // clamped to 0
        socialScore: 75, // valid
        evaluationScore: 60, // valid
      });

      // Expected: (100*0.4) + (50*0.2) + (0*0.15) + (75*0.15) + (60*0.1)
      // = 40 + 10 + 0 + 11.25 + 6 = 67.25
      expect(score).toBe(67.25);
    });
  });

  describe("calculateStarRating", () => {
    it("returns 5 stars for 90+ score", () => {
      expect(ratingService.calculateStarRating(90)).toBe(5.0);
      expect(ratingService.calculateStarRating(95)).toBe(5.0);
      expect(ratingService.calculateStarRating(100)).toBe(5.0);
    });

    it("returns 4.5 stars for 80-89 score", () => {
      expect(ratingService.calculateStarRating(80)).toBe(4.5);
      expect(ratingService.calculateStarRating(85)).toBe(4.5);
      expect(ratingService.calculateStarRating(89)).toBe(4.5);
    });

    it("returns 4 stars for 70-79 score", () => {
      expect(ratingService.calculateStarRating(70)).toBe(4.0);
      expect(ratingService.calculateStarRating(75)).toBe(4.0);
      expect(ratingService.calculateStarRating(79)).toBe(4.0);
    });

    it("returns 3.5 stars for 60-69 score", () => {
      expect(ratingService.calculateStarRating(60)).toBe(3.5);
      expect(ratingService.calculateStarRating(65)).toBe(3.5);
      expect(ratingService.calculateStarRating(69)).toBe(3.5);
    });

    it("returns 3 stars for 50-59 score", () => {
      expect(ratingService.calculateStarRating(50)).toBe(3.0);
      expect(ratingService.calculateStarRating(55)).toBe(3.0);
      expect(ratingService.calculateStarRating(59)).toBe(3.0);
    });

    it("returns 2.5 stars for 40-49 score", () => {
      expect(ratingService.calculateStarRating(40)).toBe(2.5);
      expect(ratingService.calculateStarRating(45)).toBe(2.5);
      expect(ratingService.calculateStarRating(49)).toBe(2.5);
    });

    it("returns 2 stars for 30-39 score", () => {
      expect(ratingService.calculateStarRating(30)).toBe(2.0);
      expect(ratingService.calculateStarRating(35)).toBe(2.0);
      expect(ratingService.calculateStarRating(39)).toBe(2.0);
    });

    it("returns 1.5 stars for 20-29 score", () => {
      expect(ratingService.calculateStarRating(20)).toBe(1.5);
      expect(ratingService.calculateStarRating(25)).toBe(1.5);
      expect(ratingService.calculateStarRating(29)).toBe(1.5);
    });

    it("returns 1 star for 0-19 score", () => {
      expect(ratingService.calculateStarRating(0)).toBe(1.0);
      expect(ratingService.calculateStarRating(10)).toBe(1.0);
      expect(ratingService.calculateStarRating(15)).toBe(1.0);
      expect(ratingService.calculateStarRating(19)).toBe(1.0);
    });
  });

  describe("getTierLabel", () => {
    it("returns correct labels for all star ratings", () => {
      expect(ratingService.getTierLabel(5.0)).toBe("Elite NIL Prospect");
      expect(ratingService.getTierLabel(4.5)).toBe("Power 5 Ready");
      expect(ratingService.getTierLabel(4.0)).toBe("D1 Potential");
      expect(ratingService.getTierLabel(3.5)).toBe("High D1/Mid-Major");
      expect(ratingService.getTierLabel(3.0)).toBe("Solid College Athlete");
      expect(ratingService.getTierLabel(2.5)).toBe("D2/D3 Prospect");
      expect(ratingService.getTierLabel(2.0)).toBe("Developmental");
      expect(ratingService.getTierLabel(1.5)).toBe("Emerging Talent");
      expect(ratingService.getTierLabel(1.0)).toBe("Early Stage");
    });
  });

  describe("getRatingBreakdown", () => {
    it("returns complete breakdown with all components", () => {
      const breakdown = ratingService.getRatingBreakdown({
        performanceScore: 85,
        physicalScore: 90,
        academicScore: 75,
        socialScore: 80,
        evaluationScore: 70,
      });

      expect(breakdown).toHaveProperty("compositeScore");
      expect(breakdown).toHaveProperty("starRating");
      expect(breakdown).toHaveProperty("components");
      expect(breakdown).toHaveProperty("tier");

      // Check components
      expect(breakdown.components.performance.score).toBe(85);
      expect(breakdown.components.performance.weight).toBe(40);
      expect(breakdown.components.performance.contribution).toBe(34); // 85 * 0.4

      expect(breakdown.components.physical.score).toBe(90);
      expect(breakdown.components.physical.weight).toBe(20);
      expect(breakdown.components.physical.contribution).toBe(18); // 90 * 0.2

      expect(breakdown.components.academic.score).toBe(75);
      expect(breakdown.components.academic.weight).toBe(15);
      expect(breakdown.components.academic.contribution).toBe(11.25); // 75 * 0.15

      expect(breakdown.components.social.score).toBe(80);
      expect(breakdown.components.social.weight).toBe(15);
      expect(breakdown.components.social.contribution).toBe(12); // 80 * 0.15

      expect(breakdown.components.evaluation.score).toBe(70);
      expect(breakdown.components.evaluation.weight).toBe(10);
      expect(breakdown.components.evaluation.contribution).toBe(7); // 70 * 0.1
    });

    it("calculates correct composite score and star rating", () => {
      const breakdown = ratingService.getRatingBreakdown({
        performanceScore: 95,
        physicalScore: 90,
        academicScore: 85,
        socialScore: 88,
        evaluationScore: 92,
      });

      // Expected composite: (95*0.4) + (90*0.2) + (85*0.15) + (88*0.15) + (92*0.1)
      // = 38 + 18 + 12.75 + 13.2 + 9.2 = 91.15
      expect(breakdown.compositeScore).toBe(91.15);
      expect(breakdown.starRating).toBe(5.0);
      expect(breakdown.tier).toBe("Elite NIL Prospect");
    });

    it("clamps scores in breakdown", () => {
      const breakdown = ratingService.getRatingBreakdown({
        performanceScore: 150,
        physicalScore: 50,
        academicScore: -10,
        socialScore: 75,
        evaluationScore: 200,
      });

      expect(breakdown.components.performance.score).toBe(100);
      expect(breakdown.components.physical.score).toBe(50);
      expect(breakdown.components.academic.score).toBe(0);
      expect(breakdown.components.social.score).toBe(75);
      expect(breakdown.components.evaluation.score).toBe(100);
    });
  });

  describe("integration scenarios", () => {
    it("correctly rates a high-performing athlete", () => {
      const scores = {
        performanceScore: 95,
        physicalScore: 92,
        academicScore: 88,
        socialScore: 90,
        evaluationScore: 93,
      };

      const compositeScore = ratingService.calculateCompositeScore(scores);
      const starRating = ratingService.calculateStarRating(compositeScore);

      expect(compositeScore).toBeGreaterThanOrEqual(90);
      expect(starRating).toBe(5.0);
    });

    it("correctly rates an average athlete", () => {
      const scores = {
        performanceScore: 55,
        physicalScore: 50,
        academicScore: 52,
        socialScore: 48,
        evaluationScore: 53,
      };

      const compositeScore = ratingService.calculateCompositeScore(scores);
      const starRating = ratingService.calculateStarRating(compositeScore);

      expect(compositeScore).toBeGreaterThanOrEqual(50);
      expect(compositeScore).toBeLessThan(60);
      expect(starRating).toBe(3.0);
    });

    it("correctly rates a developmental athlete", () => {
      const scores = {
        performanceScore: 35,
        physicalScore: 40,
        academicScore: 30,
        socialScore: 32,
        evaluationScore: 38,
      };

      const compositeScore = ratingService.calculateCompositeScore(scores);
      const starRating = ratingService.calculateStarRating(compositeScore);

      expect(compositeScore).toBeGreaterThanOrEqual(30);
      expect(compositeScore).toBeLessThan(40);
      expect(starRating).toBe(2.0);
    });
  });
});
