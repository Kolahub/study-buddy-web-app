"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { FileUp, X } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (fileUrl: string, metadata: any) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Check if file is PDF or image
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPEG, PNG, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your slide.",
        variant: "destructive",
      });
      return;
    }

    if (!courseId.trim()) {
      toast({
        title: "Course ID required",
        description: "Please enter a course ID for your slide.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file name
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `slides/${fileName}`;

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 100);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("content")
        .upload(filePath, selectedFile);

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      setUploadProgress(100);

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("content").getPublicUrl(filePath);

      // Save metadata to database
      const { error: dbError } = await supabase.from("slides").insert([
        {
          title,
          description,
          course_id: courseId,
          file_path: filePath,
          file_url: publicUrl,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
        },
      ]);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Upload successful",
        description: "Your slide has been uploaded successfully.",
      });

      // Call the callback with the file URL and metadata
      onUploadComplete(publicUrl, {
        title,
        description,
        courseId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        file_path: filePath,
      });

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setCourseId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`file-drop-area ${isDragging ? "drag-active" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="file-input"
          onChange={handleFileInputChange}
          accept=".pdf,.jpg,.jpeg,.png,.gif"
          disabled={isUploading}
          ref={fileInputRef}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <FileUp className="h-12 w-12 text-primary/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Drag and drop your slides here
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Support for PDF, JPEG, PNG, and GIF files. Max file size: 10MB.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Select File
          </Button>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">{selectedFile.name}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
            {selectedFile.type}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Slide Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your slide"
            disabled={isUploading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseId">Course ID *</Label>
          <Input
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Enter the course ID"
            disabled={isUploading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description (optional)"
            disabled={isUploading}
          />
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Slide"}
      </Button>
    </div>
  );
}
