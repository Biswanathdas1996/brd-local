import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onTranscriptUploaded: (transcript: any, suggestions?: any) => void;
}

export default function FileUpload({ onTranscriptUploaded }: FileUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch sample transcripts
  const { data: sampleTranscripts } = useQuery({
    queryKey: ["/api/sample-transcripts"],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-transcript', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: (transcript) => {
      setIsUploading(false);
      onTranscriptUploaded(transcript);
      toast({
        title: "File uploaded successfully",
        description: "Your transcript has been processed and is ready for BRD generation.",
      });
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Load sample mutation
  const loadSampleMutation = useMutation({
    mutationFn: async (sampleName: string) => {
      const response = await fetch('/api/load-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleName }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onTranscriptUploaded(data.transcript, {
        suggestedProcessArea: data.suggestedProcessArea,
        suggestedTargetSystem: data.suggestedTargetSystem,
      });
      toast({
        title: "Sample loaded successfully",
        description: "Sample transcript loaded with suggested process area and target system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to load sample",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['.txt', '.pdf', '.docx'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt, .pdf, or .docx file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  const handleSampleLoad = (sampleName: string) => {
    loadSampleMutation.mutate(sampleName);
  };

  return (
    <div className="space-y-6">
      {/* Sample Files Section */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3">Sample Files for Testing</h3>
        <div className="space-y-2">
          {sampleTranscripts?.map((sample: any) => (
            <div key={sample.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex items-center space-x-3">
                <FileText className="text-pwc-blue h-4 w-4" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{sample.name}</p>
                  <p className="text-xs text-slate-500">
                    {sample.processArea.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - {sample.targetSystem}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSampleLoad(sample.name)}
                disabled={loadSampleMutation.isPending}
                className="text-pwc-blue border-pwc-blue hover:bg-pwc-blue hover:text-white"
              >
                {loadSampleMutation.isPending ? <Clock className="h-3 w-3" /> : "Use Sample"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-pwc-blue bg-blue-50"
            : "border-slate-300 hover:border-pwc-blue"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-8 h-8 border-4 border-pwc-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-lg font-medium text-slate-900">Uploading...</h3>
            <p className="text-sm text-slate-500">Processing your transcript file</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Upload Transcript File</h3>
            <p className="text-sm text-slate-500 mb-4">Drag and drop your file here, or click to browse</p>
            <p className="text-xs text-slate-400 mb-4">Supports: .txt, .docx, .pdf (Max 10MB)</p>
            
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button className="bg-pwc-blue hover:bg-blue-600" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </span>
              </Button>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
