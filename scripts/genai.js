// Required imports
'use server';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";

const fileManager = new GoogleAIFileManager('AIzaSyCvdkOiiaxUzma5GS82zLv7vI5eGkctgXA');

export const genai = async (filePath, type) =>{
  console.log(`./../public/assets/${filePath}`);
    try {
        const uploadResult = await fileManager.uploadFile(
          `./../public/assets/${filePath}`,
          {
            mimeType: type,
            displayName: "Packaged Product",
          }
        );
      
        console.log(
          `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
        );
      
        console.log(uploadResult);
      
        const genAI = new GoogleGenerativeAI('AIzaSyCvdkOiiaxUzma5GS82zLv7vI5eGkctgXA');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
        const result = await model.generateContent([
          `Given an image of the back of a packaged product:
      
      Extract Information
      
      Identify and extract text related to nutritional values, ingredients, allergen information, and any warnings or notes listed.
      If multiple sections are present, organize them into categories such as "Nutritional Information," "Ingredients," "Allergens," and "Health Warnings."
      Analyze Nutritional Value
      
      Summarize the key nutritional data (e.g., calories, fat, sugar, sodium, protein, vitamins, etc.).
      Indicate whether the product contains high levels of sugar, sodium, or unhealthy fats that might not be suitable for people with diabetes or high blood pressure.
      Summarize Ingredients
      
      Provide a summary of the main ingredients, focusing on whether they are natural, artificial, or processed.
      Highlight any ingredients that might be of concern (e.g., artificial preservatives, sweeteners, or high-sodium content).
      Allergen Information
      
      Identify potential allergens listed (e.g., nuts, dairy, gluten, soy).
      Health Suitability
      
      Based on the information provided, conclude whether the product is generally healthy and specify if it is unsuitable for individuals with conditions like diabetes or high blood pressure.
      Output Format
      
      Use a structured summary format, for example:
      Product Overview
      Calories: XXX kcal
      Fat: XX g (saturated: XX g)
      Sugar: XX g
      Sodium: XX mg
      Ingredients Summary: A mix of [natural/artificial/processed] ingredients, including [key components].
      Allergen Information: Contains [list of allergens, if any].
      Suitability: [State suitability for specific health conditions].`,
      // `detect the text in the image and print it`,
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ]);
      
        const generatedText = result.response.text();
        console.log(generatedText);
      
        // const filePath = './results/5.md';
        // await fs.writeFile(filePath, generatedText, 'utf-8');
        console.log(`Generated content saved to ${filePath}`);
      } catch (error) {
        console.error("An error occurred:", error);
      }
      
}