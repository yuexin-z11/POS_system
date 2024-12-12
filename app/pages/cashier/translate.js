import axios from 'axios';

const translateText = async (text, targetLanguage) => {
    const apiKey = process.env.GOOGLE_TRANSLATION_API_KEY;
    const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATION_API_KEY}`;

    try {
        const response = await axios.post(
            url,
            null, // POST body is empty for this endpoint
            {
                params: {
                    key: apiKey,
                    q: text,
                    target: targetLanguage,
                    format: 'text',
                },
            }
        );

        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Error during translation:', error);
        return text; // Fallback to the original text
    }
};

export default translateText;