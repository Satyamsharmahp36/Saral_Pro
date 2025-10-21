import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replace(/\s/g, "_");
    const filePath = path.join(process.cwd(), "public/assets", filename);

    // Save the uploaded image file on server
    await writeFile(filePath, buffer);

    const fileManager = new GoogleAIFileManager("AIzaSyC-r2zEds7ov4nyE1xdKwiZin5PkeqbuAM");

    // Upload file to Google AI storage using absolute path
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: file.type,
      displayName: filename,
    });

    const genAI = new GoogleGenerativeAI("AIzaSyC-r2zEds7ov4nyE1xdKwiZin5PkeqbuAM");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Customized prompt for medicine analysis, usage, expiry etc.
    const prompt = `
You are an intelligent assistant analyzing medicine packaging images.
Extract the following details from the image:

- Medicine Name
- Usage instructions
- When to use the medicine
- Expiry/Best before date
- Any precautions or warnings

Provide clear, concise information about these aspects based on the image content.
`;

    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    const generatedText = await result.response.text();

    return NextResponse.json({
      message: "Success",
      status: 201,
      filePath: `/assets/${filename}`,
      data: generatedText,
    });
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json({ message: "Failed", status: 500, error: error.message });
  }
};
