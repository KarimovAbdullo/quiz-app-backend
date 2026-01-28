const axios = require("axios");

/**
 * Translate text using LibreTranslate API
 * Uzbek (uz) is the base language
 * Translates from uz → ru or uz → en
 *
 * @param {string} text - Text to translate (in Uzbek)
 * @param {string} targetLang - Target language code ("ru" or "en")
 * @param {string} sourceLang - Source language code (default: "uz")
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, targetLang, sourceLang = "uz") {
  try {
    // Use LibreTranslate API
    return await translateWithLibreTranslate(text, targetLang, sourceLang);
  } catch (error) {
    console.error("Translation error:", error.message);
    // If translation fails, return original text
    return text;
  }
}

/**
 * Translate using multiple translation APIs with fallback
 * Priority:
 * 1. Self-hosted LibreTranslate (if LIBRETRANSLATE_API_URL is set)
 * 2. Google Translate API (if GOOGLE_TRANSLATE_API_KEY is set)
 * 3. MyMemory Translation API (default, bepul)
 *
 * Environment variables:
 * - LIBRETRANSLATE_API_URL (for self-hosted LibreTranslate)
 * - LIBRETRANSLATE_API_KEY (optional, for LibreTranslate)
 * - GOOGLE_TRANSLATE_API_KEY (for Google Translate API)
 */
async function translateWithLibreTranslate(
  text,
  targetLang,
  sourceLang = "uz"
) {
  try {
    // Map language codes
    const langMap = {
      uzb: "uz",
      rus: "ru",
      eng: "en",
      uz: "uz",
      ru: "ru",
      en: "en",
    };

    const target = langMap[targetLang] || targetLang;
    const source = langMap[sourceLang] || sourceLang;

    // Skip translation if source and target are the same
    if (source === target) {
      return text;
    }

    // Priority 1: Self-hosted LibreTranslate (if URL provided)
    if (process.env.LIBRETRANSLATE_API_URL) {
      try {
        return await translateWithLibreTranslateAPI(text, target, source);
      } catch (error) {
        console.warn("LibreTranslate API failed, trying fallback...");
      }
    }

    // Priority 2: Google Translate API (if key provided)
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      try {
        return await translateWithGoogle(text, target, source);
      } catch (error) {
        console.warn("Google Translate API failed, trying fallback...");
      }
    }

    // Priority 3: MyMemory Translation API (bepul, default)
    return await translateWithMyMemory(text, target, source);
  } catch (error) {
    console.error("Translation error:", error.message);
    throw error;
  }
}

/**
 * Self-hosted LibreTranslate API
 */
async function translateWithLibreTranslateAPI(text, target, source) {
  const apiUrl = process.env.LIBRETRANSLATE_API_URL;
  const requestBody = {
    q: text,
    source: source,
    target: target,
    format: "text",
  };

  if (process.env.LIBRETRANSLATE_API_KEY) {
    requestBody.api_key = process.env.LIBRETRANSLATE_API_KEY;
  }

  const response = await axios.post(apiUrl, requestBody, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  if (response.data && response.data.translatedText) {
    return response.data.translatedText;
  }

  throw new Error("LibreTranslate API returned invalid response");
}

/**
 * MyMemory Translation API (Free, 10,000 words/day limit)
 */
async function translateWithMyMemory(text, target, source) {
  const response = await axios.get(`https://api.mymemory.translated.net/get`, {
    params: {
      q: text,
      langpair: `${source}|${target}`,
    },
    timeout: 10000,
  });

  if (
    response.data &&
    response.data.responseData &&
    response.data.responseData.translatedText
  ) {
    return response.data.responseData.translatedText;
  }

  throw new Error("MyMemory API returned invalid response");
}

/**
 * Google Translate API (Requires API key)
 */
async function translateWithGoogle(text, target, source) {
  const response = await axios.post(
    `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
    {
      q: text,
      target: target,
      source: source,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  if (response.data && response.data.data && response.data.data.translations) {
    return response.data.data.translations[0].translatedText;
  }

  throw new Error("Google Translate API returned invalid response");
}

/**
 * Translate question and options from Uzbek to Russian and English
 * Uzbek (uz) is the base language
 *
 * @param {string} questionUz - Question in Uzbek
 * @param {Array} optionsUz - Options in Uzbek [{text: string, isCorrect: boolean}]
 * @returns {Promise<Object>} - {question: {uz, ru, en}, options: [{text: {uz, ru, en}, isCorrect}]}
 */
async function translateQuestion(questionUz, optionsUz) {
  try {
    console.log("🔄 Translating question from Uzbek to Russian and English...");

    // Translate question text
    const questionRu = await translateText(questionUz, "ru", "uz");
    const questionEn = await translateText(questionUz, "en", "uz");

    // Translate each option
    const optionsTranslated = await Promise.all(
      optionsUz.map(async (option, index) => {
        console.log(`  Translating option ${index + 1}...`);
        const textRu = await translateText(option.text, "ru", "uz");
        const textEn = await translateText(option.text, "en", "uz");

        return {
          text: {
            uz: option.text, // Original Uzbek
            ru: textRu, // Translated to Russian
            en: textEn, // Translated to English
          },
          isCorrect: option.isCorrect,
        };
      })
    );

    console.log("✅ Translation completed");

    return {
      question: {
        uz: questionUz, // Original Uzbek
        ru: questionRu, // Translated to Russian
        en: questionEn, // Translated to English
      },
      options: optionsTranslated,
    };
  } catch (error) {
    console.error("❌ Error translating question:", error.message);
    // Return original Uzbek if translation fails (fallback)
    return {
      question: {
        uz: questionUz,
        ru: questionUz, // Fallback to Uzbek
        en: questionUz, // Fallback to Uzbek
      },
      options: optionsUz.map((opt) => ({
        text: {
          uz: opt.text,
          ru: opt.text, // Fallback to Uzbek
          en: opt.text, // Fallback to Uzbek
        },
        isCorrect: opt.isCorrect,
      })),
    };
  }
}

module.exports = {
  translateText,
  translateQuestion,
};

