import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const POST = async (req, res) => {
  const formData = await req.formData();

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename =  file.name.replaceAll(" ", "_");
  console.log(filename);
  try {
    await writeFile(
      path.join(process.cwd(), "public/assets/" + filename),
      buffer
    );

    const fileManager = new GoogleAIFileManager('AIzaSyCvdkOiiaxUzma5GS82zLv7vI5eGkctgXA');
    console.log(`./../public/assets/${filename}`, file);

    const uploadResult = await fileManager.uploadFile(
      `public/assets/${filename}`,
      {
        mimeType: file.type,
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
  


    return NextResponse.json({ Message: "Success", status: 201, filePath : "public/assets/" + filename, data :generatedText });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};
