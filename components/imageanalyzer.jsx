"use client";
import React, { useState } from "react";
import { Upload, FileImage, AlertCircle, CheckCircle, Loader } from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState("");

  // Original handleFileChange logic preserved
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError("");
    setSuccess("");
  };

  // Original handleUpload logic preserved
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

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-8">
      {/* Enhanced Header Section */}
      <div className="text-center mb-12 relative">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -z-10"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
        <div className="flex flex-col items-center justify-center">
        {/* Logo and title */}
        <div className="inline-block  p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl backdrop-blur-sm border border-cyan-500/30 mb-6">
          <span className="text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 drop-shadow-lg">
            SARAL PRO
          </span>
        </div>
        
        {/* Subtitle with highlight */}
        <div className="relative inline-block mb-4">
          <span className="text-2xl font-semibold text-cyan-100 relative z-10">
            Product Analyzer
          </span>
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-gradient-to-r from-cyan-500/50 to-teal-500/50 rounded-full blur-sm"></div>
        </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-cyan-100/80 max-w-xl mx-auto bg-blue-900/30 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/10 shadow-lg">
          Upload your product get detailed analysis of its contents, health implications, and recommendations.
        </p>
        
        {/* Creator badge */}
        <div className="absolute top-full right-1/2 transform translate-x-1/2 mt-2 text-xs text-cyan-300/70 bg-blue-900/30 px-3 py-1 rounded-full border border-cyan-500/20">
          Made by: Satyam Sharma
        </div>
      </div>

      <div className="max-w-md mx-auto backdrop-blur-sm bg-white/5 p-6 rounded-xl shadow-xl border border-cyan-500/20">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-cyan-500/50 rounded-lg p-8 text-center transition-all hover:border-cyan-400 mb-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept="image/*"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-4"
          >
            <div className="p-4 bg-cyan-500/20 rounded-full">
              {file ? (
                <FileImage className="w-12 h-12 text-cyan-300" />
              ) : (
                <Upload className="w-12 h-12 text-cyan-300" />
              )}
            </div>
            <span className="text-cyan-100 font-medium">
              {file ? file.name : "Click to upload or drag and drop"}
            </span>
            <span className="text-sm text-cyan-300/70">
              Supported formats: JPG, PNG, GIF
            </span>
          </label>
        </div>

        {/* Upload Button */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-3 text-white bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              "Analyze Nutrition Label"
            )}
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Analysis Results */}
        <div className="mt-6">
          <MarkdownPreview
            source={data || "Upload an image to see nutrition analysis"}
            className="text-white bg-blue-900/30 backdrop-blur-sm p-5 rounded-lg shadow-lg border border-blue-500/20 prose-headings:text-cyan-200 prose-strong:text-cyan-100"
          />
        </div>
      </div>
    </div>
  );
};

export default FileUploader;