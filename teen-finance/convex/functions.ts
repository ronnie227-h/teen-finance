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

// --- Lessons: queries & mutations ---

export const listLessons = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("lessons").collect();
  },
});

export const getLessonById = query({
  args: { lessonId: v.id("lessons") },
  async handler(ctx, args) {
    return await ctx.db.get(args.lessonId);
  },
});

export const completeLesson = mutation({
  args: { lessonId: v.id("lessons") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const [user, lesson] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("byClerk", (q) => q.eq("clerkUserId", identity.subject))
        .unique(),
      ctx.db.get(args.lessonId),
    ]);

    if (!lesson) throw new Error("Lesson not found");

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkUserId: identity.subject,
        name: identity.name ?? "New User",
        email: identity.email ?? "",
        coins: lesson.rewardCoins,
        lessonsCompleted: [args.lessonId],
        awards: [],
        currentDay: 1,
      });
      return userId;
    }

    const already = user.lessonsCompleted.some((id) => id === args.lessonId);
    if (already) return user._id;

    await ctx.db.patch(user._id, {
      coins: user.coins + lesson.rewardCoins,
      lessonsCompleted: [...user.lessonsCompleted, args.lessonId],
    });

    return user._id;
  },
});

export const seedLessons = mutation({
  args: {},
  async handler(ctx) {
    const existing = await ctx.db.query("lessons").collect();
    if (existing.length >= 6) return existing.map((l) => l._id);

    const lessons = [
      {
        title: "Stocks",
        icon: "📈",
        slides: [
          "Stocks represent ownership in a company.",
          "Price moves with supply/demand and company performance.",
        ],
        quiz: [
          {
            question: "What does a stock represent?",
            options: [
              "A loan to a company",
              "Ownership in a company",
              "A government bond",
              "A real estate property",
            ],
            correctIndex: 1,
          },
          {
            question: "Stock prices change due to?",
            options: ["Luck", "Supply and demand", "Taxes only", "Dividends only"],
            correctIndex: 1,
          },
          {
            question: "Dividends are?",
            options: [
              "Fees",
              "Company profits paid to shareholders",
              "Interest payments",
              "Taxes",
            ],
            correctIndex: 1,
          },
        ],
        rewardCoins: 1000,
      },
      {
        title: "Bonds",
        icon: "💵",
        slides: [
          "Bonds are loans to governments or companies.",
          "They pay interest and return principal at maturity.",
        ],
        quiz: [
          {
            question: "A bond is?",
            options: ["Ownership", "A loan", "A tax", "A stock"],
            correctIndex: 1,
          },
          {
            question: "Bond interest is called?",
            options: ["Dividend", "Coupon", "Rent", "Commission"],
            correctIndex: 1,
          },
          {
            question: "At maturity you get?",
            options: ["More shares", "Principal back", "Dividends", "Coupons"],
            correctIndex: 1,
          },
        ],
        rewardCoins: 1000,
      },
      {
        title: "ETFs",
        icon: "🧺",
        slides: [
          "ETFs hold a basket of assets and trade like stocks.",
          "They offer diversification and low fees.",
        ],
        quiz: [
          {
            question: "An ETF is?",
            options: [
              "A single stock",
              "A basket of assets",
              "A savings account",
              "A loan",
            ],
            correctIndex: 1,
          },
          {
            question: "ETFs typically offer?",
            options: ["High fees", "Diversification", "No trading", "Zero risk"],
            correctIndex: 1,
          },
          {
            question: "ETFs trade?",
            options: ["Only at end of day", "Like stocks", "Once a month", "Never"],
            correctIndex: 1,
          },
        ],
        rewardCoins: 1000,
      },
      {
        title: "Crypto",
        icon: "💻",
        slides: [
          "Crypto are digital assets on blockchains.",
          "They can be volatile and speculative.",
        ],
        quiz: [
          {
            question: "Bitcoin is a?",
            options: ["Stock", "Bond", "Cryptocurrency", "Commodity"],
            correctIndex: 2,
          },
          {
            question: "Blockchains are?",
            options: [
              "Central databases",
              "Distributed ledgers",
              "Paper records",
              "Banks",
            ],
            correctIndex: 1,
          },
          {
            question: "Crypto prices are often?",
            options: ["Stable", "Fixed", "Volatile", "Guaranteed"],
            correctIndex: 2,
          },
        ],
        rewardCoins: 1000,
      },
      {
        title: "Real Estate",
        icon: "🏠",
        slides: [
          "Real estate includes land and buildings.",
          "Invest via REITs or direct ownership.",
        ],
        quiz: [
          {
            question: "A REIT invests in?",
            options: ["Crypto", "Bonds", "Real estate", "Commodities"],
            correctIndex: 2,
          },
          {
            question: "Rent is?",
            options: ["Dividend", "Coupon", "Rental income", "Tax"],
            correctIndex: 2,
          },
          {
            question: "Real estate can provide?",
            options: ["Income and appreciation", "Only taxes", "Only fees", "Neither"],
            correctIndex: 0,
          },
        ],
        rewardCoins: 1000,
      },
      {
        title: "Commodities",
        icon: "🛢️",
        slides: [
          "Commodities are raw materials like oil or gold.",
          "Prices can be cyclical and driven by supply/demand.",
        ],
        quiz: [
          {
            question: "A commodity is?",
            options: ["A software", "A raw material", "A bond", "A bank"],
            correctIndex: 1,
          },
          {
            question: "Commodity prices are driven by?",
            options: ["Supply and demand", "Dividends", "Coupons", "Rent"],
            correctIndex: 0,
          },
          {
            question: "Gold is a?",
            options: ["Stock", "Commodity", "Bond", "Crypto"],
            correctIndex: 1,
          },
        ],
        rewardCoins: 1000,
      },
    ];

    const ids: any[] = [];
    for (const l of lessons) {
      const id = await ctx.db.insert("lessons", l as any);
      ids.push(id);
    }
    return ids;
  },
});
