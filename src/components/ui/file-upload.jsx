import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

export const FileUpload = ({ onChange }) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (newFiles) => {
        setFiles([...files, ...newFiles]);
        onChange && onChange(newFiles);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const { getRootProps, isDragActive } = useDropzone({
        multiple: false,
        noClick: true,
        onDrop: handleFileChange,
    });

    return (
        <div {...getRootProps()} className="p-6 border border-gray-300 rounded-md text-center">
            <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
                className="hidden"
            />
            <div onClick={handleClick} className="cursor-pointer p-4 border border-dashed">
                {isDragActive ? "Drop your file here" : "Click or drag a file to upload"}
            </div>
            <div className="mt-4">
                {files.map((file, idx) => (
                    <div key={idx} className="p-2 border-b">
                        {file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                ))}
            </div>
        </div>
    );
};
