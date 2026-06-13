import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { addConversationMessage, getConversationHistory, addTranslation, getTranslationHistory } from "../db";
import { TRPCError } from "@trpc/server";

const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: "English",
  ja: "Japanese",
  es: "Spanish",
  zh: "Chinese",
  fr: "French",
  it: "Italian",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  ru: "Russian",
  id: "Indonesian",
  pt: "Portuguese",
};

export const chatRouter = router({
  /**
   * Send a message to the AI with optional image
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        text: z.string().optional(),
        image: z.string().optional(), // base64 encoded image
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { text, image, sessionId } = input;

      if (!text && !image) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either text or image must be provided",
        });
      }

      try {
        // Get conversation history
        const history = await getConversationHistory(ctx.user.id, sessionId, 10);

        // Build messages for LLM
        const messages: Array<{
          role: "system" | "user" | "assistant";
          content: string | unknown;
        }> = [
          {
            role: "system",
            content:
              "You are a helpful AI assistant. Provide clear, concise, and accurate responses. When analyzing images, describe what you see and provide relevant insights.",
          },
        ];

        // Add conversation history
        for (const msg of history) {
          messages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          });
        }

        // Build current user message content
        const currentContent: Array<{ type: string; [key: string]: unknown }> = [];

        if (text) {
          currentContent.push({
            type: "text",
            text,
          });
        }

        if (image) {
          currentContent.push({
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${image}`,
              detail: "auto",
            },
          });
        }

        // Add current message to messages
        if (currentContent.length === 1 && currentContent[0].type === "text") {
          const textContent = currentContent[0] as unknown as { text: string };
          messages.push({
            role: "user",
            content: textContent.text,
          });
        } else {
          messages.push({
            role: "user",
            content: currentContent as unknown,
          });
        }

        // Call LLM
        const response = await invokeLLM({
          messages: messages as unknown as Parameters<typeof invokeLLM>[0]["messages"],
        }) as { choices: Array<{ message: { content: string } }> };

        const assistantMessage = response.choices[0]?.message?.content || "I encountered an error processing your request.";

        // Save messages to database
        await addConversationMessage({
          userId: ctx.user.id,
          sessionId,
          role: "user",
          content: text || "[Image shared]",
          hasImage: image ? 1 : 0,
        });

        await addConversationMessage({
          userId: ctx.user.id,
          sessionId,
          role: "assistant",
          content: assistantMessage,
          hasImage: 0,
        });

        return {
          success: true,
          response: assistantMessage,
          sessionId,
        };
      } catch (error) {
        console.error("[Chat] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process chat message",
          cause: error,
        });
      }
    }),

  /**
   * Get conversation history for a session
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const messages = await getConversationHistory(ctx.user.id, input.sessionId);
        return {
          success: true,
          messages,
        };
      } catch (error) {
        console.error("[Chat] Error getting history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve conversation history",
        });
      }
    }),

  /**
   * Translate text to a target language
   */
  translate: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        targetLanguage: z.string(),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { text, targetLanguage, sessionId } = input;

      if (!SUPPORTED_LANGUAGES[targetLanguage]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unsupported language: ${targetLanguage}`,
        });
      }

      try {
        // Get conversation history for context
        const history = await getConversationHistory(ctx.user.id, sessionId, 3);

        // Build translation prompt
        const languageName = SUPPORTED_LANGUAGES[targetLanguage];
        let contextText = "";

        if (history.length > 0) {
          contextText = "\n\nRecent conversation context for reference:\n";
          for (let i = 0; i < history.length; i++) {
            const msg = history[i];
            const role = msg.role === "user" ? "User" : "AI Assistant";
            contextText += `${i + 1}. ${role}: ${msg.content}\n`;
          }
        }

        const prompt = `You are a professional translator. Please translate the following text to ${languageName}.

IMPORTANT INSTRUCTIONS:
1. Consider the conversation context provided below to ensure accurate and contextually appropriate translation
2. Maintain the tone and style of the original text
3. If the text contains technical terms or proper nouns, keep them appropriately
4. Provide ONLY the translated text without any explanations or additional comments
5. If the text is already in ${languageName}, return it as-is

Text to translate: "${text}"${contextText}

Translation:`;

        // Call LLM for translation
        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ] as unknown as Parameters<typeof invokeLLM>[0]["messages"],
        }) as { choices: Array<{ message: { content: string } }> };

        const translatedText = (response.choices[0]?.message?.content || "").trim();

        // Save translation to database
        await addTranslation({
          userId: ctx.user.id,
          sessionId,
          originalText: text,
          translatedText,
          targetLanguage,
        });

        return {
          success: true,
          originalText: text,
          translatedText,
          targetLanguage,
          languageName,
        };
      } catch (error) {
        console.error("[Translation] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to translate text",
          cause: error,
        });
      }
    }),

  /**
   * Get supported languages
   */
  getSupportedLanguages: publicProcedure.query(() => {
    return {
      success: true,
      languages: SUPPORTED_LANGUAGES,
    };
  }),

  /**
   * Get translation history for a session
   */
  getTranslationHistory: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const translations = await getTranslationHistory(ctx.user.id, input.sessionId);
        return {
          success: true,
          translations,
        };
      } catch (error) {
        console.error("[Translation] Error getting history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve translation history",
        });
      }
    }),
});
