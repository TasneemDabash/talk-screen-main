import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("chat router", () => {
  it("should get supported languages", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.getSupportedLanguages();

    expect(result.success).toBe(true);
    expect(result.languages).toBeDefined();
    expect(result.languages.en).toBe("English");
    expect(result.languages.ja).toBe("Japanese");
    expect(Object.keys(result.languages).length).toBeGreaterThan(0);
  });

  it("should reject sendMessage without text or image", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.chat.sendMessage({
        sessionId: "test-session",
      });
      expect.fail("Should have thrown an error");
    } catch (error: unknown) {
      const err = error as { code?: string };
      expect(err.code).toBe("BAD_REQUEST");
    }
  });

  it("should get conversation history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.getHistory({
      sessionId: "test-session",
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.messages)).toBe(true);
  });

  it("should reject translation with unsupported language", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.chat.translate({
        text: "Hello",
        targetLanguage: "unsupported-lang",
        sessionId: "test-session",
      });
      expect.fail("Should have thrown an error");
    } catch (error: unknown) {
      const err = error as { code?: string };
      expect(err.code).toBe("BAD_REQUEST");
    }
  });

  it("should get translation history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.getTranslationHistory({
      sessionId: "test-session",
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.translations)).toBe(true);
  });
});
