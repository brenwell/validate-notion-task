const { test, expect } = require("@jest/globals");
const {
  extractTicketIdFromBranchName,
  extractTicketIdFromPrTitle,
} = require("./index.js");
const { Client } = require("@notionhq/client");
const core = require("@actions/core");

jest.mock("@notionhq/client");

describe("extractTicketIdFromBranchName", () => {
  test("extracts the numeric ID from 'PREFIX-<number>'", () => {
    const result = extractTicketIdFromBranchName("AWT-123", "AWT");
    expect(result).toBe(123);
  });

  test("extracts the numeric ID from '[PREFIX-<number>]'", () => {
    const result = extractTicketIdFromBranchName("[AWT-123]", "AWT");
    expect(result).toBe(123);
  });

  test("extracts the numeric ID from '[ PREFIX-<number> ]'", () => {
    const result = extractTicketIdFromBranchName("[ AWT-123 ]", "AWT");
    expect(result).toBe(123);
  });

  test("extracts the numeric ID from '[ PREFIX-<number>]'", () => {
    const result = extractTicketIdFromBranchName("[ AWT-123]", "AWT");
    expect(result).toBe(123);
  });

  test("extracts the numeric ID from 'feature/PREFIX-<number>'", () => {
    const result = extractTicketIdFromBranchName("feature/AWT-123", "AWT");
    expect(result).toBe(123);
  });

  test("is case-insensitive for the prefix", () => {
    const result = extractTicketIdFromBranchName("feature/awt-456", "AWT");
    expect(result).toBe(456);
  });

  test("throws an error if no valid ID is found", () => {
    expect(() =>
      extractTicketIdFromBranchName("feature/invalid-branch", "AWT")
    ).toThrow('Expected "AWT-<number>" in "feature/invalid-branch"');
  });

  test("throws an error if the prefix is not followed by a number", () => {
    expect(() => extractTicketIdFromBranchName("feature/AWT-", "AWT")).toThrow(
      'Expected "AWT-<number>" in "feature/AWT-"'
    );
  });

  test("extracts the numeric ID when the prefix has special characters", () => {
    const result = extractTicketIdFromBranchName(
      "feature/ABC+123-789",
      "ABC+123"
    );
    expect(result).toBe(789);
  });
});
describe("extractTicketIdFromPrTitle", () => {
  test("extracts the numeric ID from '[PREFIX-<number>] Title'", () => {
    const result = extractTicketIdFromPrTitle(
      "[AWT-123] Implement feature",
      "AWT"
    );
    expect(result).toBe(123);
  });

  test("extracts the numeric ID from 'PREFIX-<number> Title'", () => {
    const result = extractTicketIdFromPrTitle("AWT-456 Fix bug", "AWT");
    expect(result).toBe(456);
  });

  test("extracts the numeric ID from '[ PREFIX-<number> ] Title'", () => {
    const result = extractTicketIdFromPrTitle("[ AWT-789 ] Add tests", "AWT");
    expect(result).toBe(789);
  });

  test("extracts the numeric ID from '[PREFIX-<number>]'", () => {
    const result = extractTicketIdFromPrTitle("[AWT-321]", "AWT");
    expect(result).toBe(321);
  });

  test("is case-insensitive for the prefix", () => {
    const result = extractTicketIdFromPrTitle("[awt-654] Update docs", "AWT");
    expect(result).toBe(654);
  });

  test("throws an error if valid id is not found at the start", () => {
    expect(() =>
      extractTicketIdFromPrTitle("Invalid title [AWT-123]", "AWT")
    ).toThrow(
      'Expected "AWT-<number>" at the start of "Invalid title [AWT-123]"'
    );
  });

  test("throws an error if no valid ID is found", () => {
    expect(() =>
      extractTicketIdFromPrTitle("Invalid title format", "AWT")
    ).toThrow('Expected "AWT-<number>" at the start of "Invalid title format"');
  });

  test("throws an error if the prefix is not followed by a number", () => {
    expect(() =>
      extractTicketIdFromPrTitle("[AWT-] Missing number", "AWT")
    ).toThrow(
      'Expected "AWT-<number>" at the start of "[AWT-] Missing number"'
    );
  });

  test("extracts the numeric ID when the prefix has special characters", () => {
    const result = extractTicketIdFromPrTitle(
      "[ABC+123-456] Special prefix",
      "ABC+123"
    );
    expect(result).toBe(456);
  });
});
