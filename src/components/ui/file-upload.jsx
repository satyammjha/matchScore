import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.mjs";
import { GoogleGenerativeAI } from "@google/generative-ai";

function PDFParserReact() {
    const [currentPdf, setCurrentPdf] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [skills, setSkills] = useState([]);
    const [processingSkills, setProcessingSkills] = useState(false);

    const genAI = new GoogleGenerativeAI();

    const extractText = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setProcessingSkills(true);

        const reader = new FileReader();
        reader.onload = async function () {
            try {
                const typedArray = new Uint8Array(reader.result);
                pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("pdf.worker.mjs");
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                let extractedText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    extractedText += textContent.items.map((item) => item.str).join(" ") + "\n";
                }

                setCurrentPdf({
                    id: Date.now(),
                    name: file.name,
                    text: extractedText || "No text found in the PDF",
                    date: new Date().toLocaleString()
                });

                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const prompt = `Extract technical skills from this resume text as a comma-separated list. Return only the top 10 skills based on the current industry trends and should be maximum of 10 skills only, nothing else: ${extractedText}`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const skillsList = response.text().split(',').map(skill => skill.trim());
                
                setSkills(skillsList);
            } catch (error) {
                console.error("Error:", error);
                setSkills(["Failed to extract skills"]);
            } finally {
                setIsLoading(false);
                setProcessingSkills(false);
                event.target.value = "";
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const deletePdf = () => {
        setCurrentPdf(null);
        setSkills([]);
    };

    return (
        <div className="max-w-md min-w-[400px] min-h-[500px] p-5 bg-gray-50">
            <header className="text-center mb-5">
                <h1 className="text-xl font-bold text-slate-800">Resume Analyzer</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {currentPdf ? "Analyzing your resume..." : "Upload resume to extract skills"}
                </p>
            </header>

            {!currentPdf ? (
                <div className="mb-5 text-center">
                    <label className={`inline-block px-4 py-2 rounded-md cursor-pointer transition-colors
                        ${isLoading ? 
                            'bg-gray-400 cursor-not-allowed' : 
                            'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={extractText}
                            disabled={isLoading}
                            className="hidden"
                        />
                        {isLoading ? "Processing..." : "Upload PDF"}
                    </label>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-4 relative">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">{currentPdf.name}</h2>
                            <p className="text-xs text-slate-500">{currentPdf.date}</p>
                        </div>
                        <button
                            onClick={deletePdf}
                            className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-md font-semibold mb-2">Extracted Skills:</h3>
                        <div className="flex flex-wrap gap-2">
                            {processingSkills ? (
                                <div className="text-sm text-gray-500">Analyzing skills...</div>
                            ) : (
                                skills.map((skill, index) => (
                                    <div 
                                        key={index}
                                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                                    >
                                        {skill}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <label className="inline-block px-4 py-2 rounded-md cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={extractText}
                                className="hidden"
                            />
                            Upload New Resume
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PDFParserReact;