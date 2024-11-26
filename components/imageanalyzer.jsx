"use client";
import React, { use, useState } from "react";
import { Upload } from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError("");
    setSuccess("");
  };

  const handleUpload = async () => {
    console.log(file);
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }).then((res) => res.json());

      // const resData = genai(response.filePath, file.type);

      setData(response.data);

      console.log(response);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setSuccess("File uploaded successfully!");
      setFile(null);
    } catch (err) {
      setError("Failed to upload file: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          accept="image/*"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600">
            {file ? file.name : "Click to upload or drag and drop"}
          </span>
          <span className="text-sm text-gray-500">
            Supported formats: JPG, PNG, GIF
          </span>
        </label>
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      )}

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {success && <div className="text-green-500 text-sm">{success}</div>}

      <MarkdownPreview
        source={
          data || "Upload an image"
        }
        className="text-white bg-gray-900 p-4 rounded-md shadow-md w-full"
      />
    </div>
  );
};

export default FileUploader;
