import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Clock, Trash, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SlideCardProps {
  slide: {
    id: string;
    title: string;
    description?: string;
    course_id: string;
    file_url: string;
    file_type: string;
    file_path?: string;
    created_at: string;
  };
  onDelete?: (slideId: string, filePath: string) => Promise<void>;
}

export function SlideCard({ slide, onDelete }: SlideCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isImage = slide.file_type.startsWith("image/");
  const isPdf = slide.file_type === "application/pdf";
  const formattedDate = new Date(slide.created_at).toLocaleDateString();

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(slide.id, slide.file_path || "");
        // Automatically close the dialog when deletion is successful
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error deleting slide:", error);
        // In case of error, we keep the dialog open so the user can try again
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="slide-card overflow-hidden">
      <div className="aspect-video bg-muted relative flex items-center justify-center">
        {isImage ? (
          <img
            src={slide.file_url || "/placeholder.svg"}
            alt={slide.title}
            className="object-cover w-full h-full"
          />
        ) : isPdf ? (
          <div className="flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-primary/50" />
            <span className="text-sm text-muted-foreground mt-2">
              PDF Document
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-primary/50" />
            <span className="text-sm text-muted-foreground mt-2">Document</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{slide.title}</CardTitle>
          <Badge variant="outline">{slide.course_id}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {slide.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {slide.description}
          </p>
        )}
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>Uploaded on {formattedDate}</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={slide.file_url} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-1" />
              View
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={slide.file_url} download>
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </Button>
        </div>

        {onDelete && (
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the slide "{slide.title}". This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
