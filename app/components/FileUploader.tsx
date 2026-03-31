import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '~/lib/utils';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);

    const maxFileSize = 20 * 1024 * 1024; // 20MB

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0] || null;

        setFile(selectedFile);          // ✅ control UI state
        onFileSelect?.(selectedFile);   // ✅ notify parent
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    });

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div
                            className="uploader-selected-file flex items-center justify-between p-3 border rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center space-x-3">
                                <img src="/images/pdf.png" alt="pdf" className="w-10 h-10" />
                                
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>

                            <button
                                className="p-2 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);           // ✅ clear UI
                                    onFileSelect?.(null);    // ✅ notify parent
                                }}
                            >
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className="w-16 h-16" />
                            </div>

                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    {isDragActive ? "Drop the file here" : "Click to upload"}
                                </span>{" "}
                                or drag and drop
                            </p>

                            <p className="text-sm text-gray-400 mt-1">
                                PDF (max {formatSize(maxFileSize)})
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;