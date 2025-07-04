import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const model = google("gemini-2.0-flash-001");

// Define the schema for the recipe object
const recipeSchema = z.object({
  title: z.string().describe("The name of the recipe"),
  description: z.string().describe("A brief description of the recipe"),
  servings: z.number().describe("Number of servings"),
  prepTime: z.number().describe("Preparation time in minutes"),
  cookTime: z.number().describe("Cooking time in minutes"),
  ingredients: z.array(z.string()).describe("List of ingredients with quantities"),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
  tags: z.array(z.string()).describe("Recipe tags (e.g., vegetarian, quick, etc.)"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level of the recipe"),
  nutrition: z.object({
    calories: z.number().describe("Estimated calories per serving"),
    protein: z.string().describe("Protein content (e.g., '20g')"),
    carbs: z.string().describe("Carbohydrate content (e.g., '45g')"),
    fat: z.string().describe("Fat content (e.g., '12g')")
  }).describe("Nutritional information")
});

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
  }.`;

  try {
    console.log('Sending request to Gemini 2.0 Flash API...');
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
    }

    const result = await generateObject({
      model: model,
      prompt: prompt,
      schema: recipeSchema,
    });
    
    console.log('Generated recipe:', result.object);
    return result.object;
    
  } catch (error) {
    console.error('Error generating recipe:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('Unknown error occurred during recipe generation');
  }
}
