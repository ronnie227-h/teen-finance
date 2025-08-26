// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- Users ---
  users: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    coins: v.number(),
    // 用文档ID来记录完成的课程，更好做关联与校验
    lessonsCompleted: v.array(v.id("lessons")),
    awards: v.array(v.id("awards")),
    currentDay: v.number(),
    groupId: v.optional(v.id("groups")),
  }).index("byClerk", ["clerkUserId"]),

  // --- Lessons ---
  lessons: defineTable({
    name: v.string(),
    pages: v.number(),
    awardId: v.optional(v.id("awards")),
  }),

  // --- Awards ---
  awards: defineTable({
    name: v.string(),
  }),

  // --- Groups ---
  groups: defineTable({
    name: v.string(),
    code: v.string(),
    members: v.array(v.id("users")),
  }).index("byCode", ["code"]),

  // --- Prices (market data) ---
  prices: defineTable({
    day: v.number(),
    symbol: v.string(),
    type: v.union(v.literal("stock"), v.literal("etf")),
    price: v.number(),
  })
    .index("byDay", ["day"])
    .index("byDaySymbol", ["day", "symbol"]),

  // --- Leaderboard snapshots ---
  leaderboard: defineTable({
    groupId: v.id("groups"),
    totalScore: v.number(),
    snapshotDay: v.number(),
  }).index("byGroupDay", ["groupId", "snapshotDay"]),
});
