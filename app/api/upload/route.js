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

    const fileManager = new GoogleAIFileManager('AIzaSyAvYxVUIHlCftm6D_Q5dn5RumPZoM37ivM');
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
  
    const genAI = new GoogleGenerativeAI('AIzaSyAvYxVUIHlCftm6D_Q5dn5RumPZoM37ivM');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    const result = await model.generateContent([
      `Analyze the provided image and perform the following tasks:

Analyze the image to identify and describe the product, including its color, shape, material, and category
 (e.g., electronics, packaged food, clothing, tools). Extract and interpret any visible text, such as brand names,
  labels, specifications, or instructions, and provide a detailed review covering its features, quality, functionality,
   pricing, and potential pros and cons. Based on the extracted information, evaluate the product’s usability how it works  how to use it`,
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
