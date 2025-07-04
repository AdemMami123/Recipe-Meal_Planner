import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateRecipe(params: {
  ingredients: string;
  cuisine?: string;
  dietaryRestrictions?: string;
  cookingTime?: string;
  difficulty?: string;
}) {
  const { ingredients, cuisine, dietaryRestrictions, cookingTime, difficulty } = params;
  
  const prompt = `Generate a detailed recipe using these ingredients: ${ingredients}${
    cuisine ? ` in ${cuisine} cuisine style` : ''
  }${
    dietaryRestrictions ? ` with dietary restrictions: ${dietaryRestrictions}` : ''
  }${
    cookingTime ? ` that takes about ${cookingTime} to prepare` : ''
  }${
    difficulty ? ` with ${difficulty} difficulty level` : ''
  }. 

  Please format the response as a JSON object with the following structure:
  {
    "title": "Recipe Name",
    "description": "Brief description",
    "servings": 4,
    "prepTime": 15,
    "cookTime": 30,
    "ingredients": [
      "1 cup ingredient 1",
      "2 tbsp ingredient 2"
    ],
    "instructions": [
      "Step 1...",
      "Step 2..."
    ],
    "tags": ["tag1", "tag2"],
    "difficulty": "easy",
    "nutrition": {
      "calories": 350,
      "protein": "20g",
      "carbs": "45g",
      "fat": "12g"
    }
  }`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw error;
  }
}
