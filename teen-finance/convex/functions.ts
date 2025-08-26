// convex/functions.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * 确保当前 Clerk 登录用户在数据库中有一条记录。
 * 如果已存在 -> 返回 _id
 * 如果不存在 -> 新建并返回 _id
 */
export const ensureUser = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // 检查是否已有这个 clerkUserId 的用户
    const existing = await ctx.db
      .query("users")
      .withIndex("byClerk", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (existing) return existing._id;

    // 插入新用户
    const userId = await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      name: identity.name ?? "New User",
      email: identity.email ?? "",
      coins: 10000,
      lessonsCompleted: [], // schema: v.array(v.id("lessons"))
      awards: [],           // schema: v.array(v.id("awards"))
      currentDay: 1,
      // ⚠️ 不要显式传 undefined，可选字段直接不写
    });

    return userId;
  },
});

/**
 * 可选调试用：获取当前登录用户完整文档。
 */
export const getMe = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("byClerk", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

/**
 * 设置/更新当前用户的基本资料（例如名字）。
 * 如果用户记录不存在，则创建后再更新。
 */
export const setProfile = mutation({
  args: { name: v.string() },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 查找现有记录
    const existing = await ctx.db
      .query("users")
      .withIndex("byClerk", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!existing) {
      // 不存在则创建
      const userId = await ctx.db.insert("users", {
        clerkUserId: identity.subject,
        name: args.name,
        email: identity.email ?? "",
        coins: 10000,
        lessonsCompleted: [],
        awards: [],
        currentDay: 1,
      });
      return userId;
    }

    // 存在则更新
    await ctx.db.patch(existing._id, { name: args.name });
    return existing._id;
  },
});
