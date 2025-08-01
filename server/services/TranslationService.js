import axios from 'axios';

export class TranslationService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    this.googleApiUrl = process.env.GOOGLE_TRANSLATE_API_URL || 'https://translation.googleapis.com/language/translate/v2';
  }

  async detectLanguage(text) {
    try {
      // If no API key, return mock detection
      if (!this.googleApiKey || this.googleApiKey.includes('dummy')) {
        return this.mockLanguageDetection(text);
      }

      const response = await axios.post(
        `${this.googleApiUrl}/detect`,
        {
          q: text
        },
        {
          params: {
            key: this.googleApiKey
          },
          timeout: 5000
        }
      );

      const detection = response.data.data.detections[0][0];
      return detection.language;
    } catch (error) {
      console.error('Language detection error:', error.message);
      return this.mockLanguageDetection(text);
    }
  }

  async translate(text, sourceLanguage, targetLanguage) {
    try {
      // If no API key, return mock translation
      if (!this.googleApiKey || this.googleApiKey.includes('dummy')) {
        return this.mockTranslation(text, sourceLanguage, targetLanguage);
      }

      const response = await axios.post(
        this.googleApiUrl,
        {
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        },
        {
          params: {
            key: this.googleApiKey
          },
          timeout: 10000
        }
      );

      const translation = response.data.data.translations[0];
      return {
        translatedText: translation.translatedText,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        confidence: 0.95
      };
    } catch (error) {
      console.error('Translation error:', error.message);
      return this.mockTranslation(text, sourceLanguage, targetLanguage);
    }
  }

  async getSupportedLanguages() {
    try {
      // If no API key, return mock languages
      if (!this.googleApiKey || this.googleApiKey.includes('dummy')) {
        return this.getMockSupportedLanguages();
      }

      const response = await axios.get(
        `${this.googleApiUrl}/languages`,
        {
          params: {
            key: this.googleApiKey,
            target: 'en'
          },
          timeout: 5000
        }
      );

      return response.data.data.languages.map(lang => ({
        code: lang.language,
        name: lang.name
      }));
    } catch (error) {
      console.error('Get languages error:', error.message);
      return this.getMockSupportedLanguages();
    }
  }

  mockLanguageDetection(text) {
    // Simple heuristic-based language detection
    const patterns = {
      'es': /[ñáéíóúü]/i,
      'fr': /[àâäéèêëïîôöùûüÿç]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìíîòóù]/i,
      'pt': /[ãâáàçéêíóôõú]/i,
      'ru': /[а-яё]/i,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
      'ar': /[\u0600-\u06ff]/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en'; // Default to English
  }

  mockTranslation(text, sourceLanguage, targetLanguage) {
    // For demo purposes, return the original text with a note
    if (sourceLanguage === targetLanguage) {
      return {
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        confidence: 1.0
      };
    }

    return {
      translatedText: `[Translated from ${sourceLanguage} to ${targetLanguage}] ${text}`,
      sourceLanguage,
      targetLanguage,
      confidence: 0.85
    };
  }

  getMockSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'tr', name: 'Turkish' },
      { code: 'pl', name: 'Polish' },
      { code: 'nl', name: 'Dutch' }
    ];
  }
}