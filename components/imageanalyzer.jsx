"use client";
import React, { useState, useEffect } from "react";
import { Upload, FileImage, CheckCircle, Loader } from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";

// Language options (abbreviated example, add more if you want)
const languages = [
  { code: "auto", name: "Auto", native: "Detect" },
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "zh-CN", name: "Chinese (Simplified)", native: "中文简体" },
  { code: "ar", name: "Arabic", native: "عربي" },
];

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [data, setData] = useState("");
  const [translated, setTranslated] = useState("");
  const [inputLang, setInputLang] = useState("auto");
  const [outputLang, setOutputLang] = useState("en");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setSuccess("");
    setData("");
    setTranslated("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setSuccess("");
    setData("");
    setTranslated("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setUploading(false);
        return;
      }

      const json = await response.json();
      setData(json.data);
      setSuccess("Medicine analysis complete!");
      setFile(null);
    } catch {
      // Silent catch
    } finally {
      setUploading(false);
    }
  };

  // Translate analysis output on data or language settings change
  useEffect(() => {
    if (!data || inputLang === "" || outputLang === "") {
      setTranslated("");
      return;
    }

    const sourceLang = inputLang === "auto" ? "auto" : inputLang;

    const translateText = async () => {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${outputLang}&dt=t&q=${encodeURIComponent(
          data
        )}`;
        const res = await fetch(url);
        const json = await res.json();
        const translatedText = json[0].map((item) => item[0]).join("");
        setTranslated(translatedText);
      } catch {
        setTranslated("Translation unavailable");
      }
    };

    translateText();
  }, [data, inputLang, outputLang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-8">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -z-10"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
        <div className="flex flex-col items-center justify-center">
          <div className="inline-block p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl backdrop-blur-sm border border-cyan-500/30 mb-6">
            <span className="text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 drop-shadow-lg">
              Nirogya Medi Scan
            </span>
          </div>
          <div className="relative inline-block mb-4">
            <span className="text-2xl font-semibold text-cyan-100 relative z-10">Medicine Analyzer</span>
            <div className="absolute -bottom-1 left-0 w-full h-2 bg-gradient-to-r from-cyan-500/50 to-teal-500/50 rounded-full blur-sm"></div>
          </div>
        </div>
        <p className="text-sm text-cyan-100/80 max-w-xl mx-auto bg-blue-900/30 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/10 shadow-lg">
          Upload your product get detailed analysis of its contents, health implications, and recommendations.
        </p>
        <div className="absolute top-full right-1/2 transform translate-x-1/2 mt-2 text-xs text-cyan-300/70 bg-blue-900/30 px-3 py-1 rounded-full border border-cyan-500/20">
           
        </div>
      </div>
      {/* Upload Box */}
      <div className="max-w-md mx-auto backdrop-blur-sm bg-white/5 p-6 rounded-xl shadow-xl border border-cyan-500/20">
        <div
          className="border-2 border-dashed border-cyan-500/50 rounded-lg p-8 text-center transition-all hover:border-cyan-400 mb-4 cursor-pointer"
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept="image/*"
          />
          <label htmlFor="file-upload" className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-cyan-500/20 rounded-full">
              {file ? <FileImage className="w-12 h-12 text-cyan-300" /> : <Upload className="w-12 h-12 text-cyan-300" />}
            </div>
            <span className="text-cyan-100 font-medium">{file ? file.name : "Click to upload or drag and drop"}</span>
            <span className="text-sm text-cyan-300/70">Supported formats: JPG, PNG, GIF</span>
          </label>
        </div>
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
              "Analyze Medicine"
            )}
          </button>
        )}
        {success && (
          <div className="mt-4 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {/* Analysis Result */}
        {data && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Analysis Result</h3>
            <MarkdownPreview
              source={data}
              className="text-white bg-blue-900/30 backdrop-blur-sm p-5 rounded-lg shadow-lg border border-blue-500/20 prose-headings:text-cyan-200 prose-strong:text-cyan-100"
            />
          </div>
        )}
        {/* Language Selectors and Translated Output */}
        {data && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Translate Output</h3>
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
    </div>
  );
};

export default FileUploader;
