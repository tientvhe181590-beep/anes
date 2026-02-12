import { describe, expect, it } from "vitest";
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateAll,
} from "../calculations";

describe("calculations", () => {
  it("calculates BMR for male and female", () => {
    const maleBmr = calculateBMR("Male", 80, 180, 30);
    const femaleBmr = calculateBMR("Female", 80, 180, 30);

    expect(maleBmr).toBeCloseTo(1780, 2);
    expect(femaleBmr).toBeCloseTo(1619, 2);
  });

  it("calculates TDEE and calorie target", () => {
    const tdee = calculateTDEE(1780, "Low");
    const target = calculateCalorieTarget(tdee, "StayFit");

    expect(tdee).toBeCloseTo(2136, 2);
    expect(target).toBeCloseTo(2136, 2);
  });

  it("calculates all values in one call", () => {
    const result = calculateAll({
      gender: "Male",
      weightKg: 70,
      heightCm: 175,
      age: 25,
      activity: "Medium",
      goal: "WeightLoss",
    });

    expect(result.bmr).toBeCloseTo(1673.75, 2);
    expect(result.tdee).toBeCloseTo(2594.31, 2);
    expect(result.calorieTarget).toBeCloseTo(2094.31, 2);
  });
});
