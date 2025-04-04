// Required imports
'use server';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";

const fileManager = new GoogleAIFileManager('AIzaSyAvYxVUIHlCftm6D_Q5dn5RumPZoM37ivM');

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
          `Analyze the provided image and perform the following tasks:

Image Analysis:

Identify and describe the key elements and context of the image (e.g., objects, people, environment).
Determine whether the image relates to a disaster (natural or man-made, such as floods, earthquakes, fires, or accidents).
Disaster Identification:

If it is a disaster, specify the type of disaster and its severity based on visual indicators.
Geolocation-Based Assistance:

Extract or infer the location tagged in the image metadata or visually recognized landmarks.
Provide a list of emergency contact numbers (fire, medical, police, disaster management) specific to the identified location or its state emergency number.
Emergency Description:

Offer a concise description of the situation depicted in the image and advice for immediate steps to ensure safety or seek assistance.
Ensure the response is clear and actionable, including any relevant context or precautions related to the identified disaster.`,
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