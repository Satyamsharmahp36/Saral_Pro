"use client";

import React, { useState, useEffect } from "react";
import { Upload, FileImage, AlertCircle, CheckCircle, Loader } from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";

const languages = [
  { no: "0", name: "Auto", native: "Detect", code: "auto" },
  { no: "1", name: "Hindi", native: "हिन्दी", code: "hi" },
  { no: "2", name: "English", native: "English", code: "en" },
  { no: "3", name: "Spanish", native: "Español", code: "es" },
  { no: "4", name: "French", native: "Français", code: "fr" },
  // Add rest of languages as needed...
];

const Gemini = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [inputLang, setInputLang] = useState("auto");
  const [outputLang, setOutputLang] = useState("en");
  const [translated, setTranslated] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setSuccess("");
    setAnalysis("");
    setTranslated("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a medicine image first");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    setTranslated("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Upload failed");
      }

      const data = await response.json();

      setAnalysis(data.data);
      setSuccess("Medicine analysis complete!");
    } catch (err) {
      setError("Failed to analyze medicine: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Translate the analysis output using Google Translate unofficial API
  const translate = async () => {
    if (!analysis) return setTranslated("");

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLang}&tl=${outputLang}&dt=t&q=${encodeURIComponent(analysis)}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const translatedText = json[0].map((item) => item[0]).join("");
      setTranslated(translatedText);
    } catch {
      setTranslated("Translation unavailable");
    }
  };

  // Automatically translate on analysis/output language change
  useEffect(() => {
    translate();
  }, [analysis, inputLang, outputLang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black p-8 text-white max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-4 text-cyan-400">Nirogya Medi Scan</h1>
      <p className="mb-6 text-cyan-200">
        Upload medicine packaging image to analyze name, usage instructions, expiry date, and precautions.
      </p>

      <div className="mb-4 border-2 border-cyan-500/40 rounded-lg p-6 bg-white/10">
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 w-full" />
        {file && (
          <div className="flex items-center gap-4 mb-4">
            <FileImage className="w-12 h-12 text-cyan-300" />
            <span>{file.name}</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-cyan-600 hover:bg-cyan-500 transition-colors rounded-md py-3 px-6 font-semibold disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {uploading ? <Loader className="w-5 h-5 animate-spin" /> : "Analyze Medicine"}
        </button>

        {error && <p className="text-red-500 mt-3 flex items-center gap-2"><AlertCircle />{error}</p>}
        {success && <p className="text-green-400 mt-3 flex items-center gap-2"><CheckCircle />{success}</p>}
      </div>

      {analysis && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Analysis Result</h2>
          <MarkdownPreview source={analysis} className="prose prose-invert bg-blue-900/30 p-4 rounded-md border border-blue-500/20" />
        </div>
      )}

      {analysis && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Translate Output</h2>

          <div className="flex gap-4 mb-3">
            <select
              value={inputLang}
              onChange={(e) => setInputLang(e.target.value)}
              className="bg-black text-white rounded p-2 flex-grow"
              title="Source Language"
            >
              {languages.map(({ code, name, native }) => (
                <option key={code} value={code}>
                  {name} ({native})
                </option>
              ))}
            </select>

            <select
              value={outputLang}
              onChange={(e) => setOutputLang(e.target.value)}
              className="bg-black text-white rounded p-2 flex-grow"
              title="Target Language"
            >
              {languages.map(({ code, name, native }) => (
                <option key={code} value={code}>
                  {name} ({native})
                </option>
              ))}
            </select>
          </div>

          <textarea
            readOnly
            value={translated}
            rows={8}
            className="w-full rounded-md p-3 bg-black/70 text-white font-mono"
            placeholder="Translated text will appear here"
          />
        </div>
      )}
    </div>
  );
};

export default Gemini;
