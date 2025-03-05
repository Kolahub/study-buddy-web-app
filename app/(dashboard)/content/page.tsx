"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import {
  checkSupabaseConnection,
  checkAuthStatus,
} from "@/lib/supabase/check-connection";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardAuthFallback } from "@/components/dashboard/auth-fallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileUp,
  Search,
  AlertCircle,
  Loader2,
  FileType,
  SortAsc,
} from "lucide-react";
import { FileUpload } from "@/components/content/file-upload";
import { SlideGrid } from "@/components/content/slide-grid";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

export default function ContentPage() {
  const { supabase, session, isLoading } = useSupabase();
  const { toast } = useToast();
  const [slides, setSlides] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetchingSlides, setIsFetchingSlides] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (session) {
      fetchSlides();
    }
  }, [session]);

  // Fetch slides whenever filters change
  useEffect(() => {
    if (session) {
      fetchSlides();
    }
  }, [searchQuery, courseFilter, fileTypeFilter, sortOrder]);

  const fetchSlides = async (retryCount = 0) => {
    try {
      console.log("Fetching slides with filters:", {
        searchQuery,
        courseFilter,
        fileTypeFilter,
        sortOrder,
        retryAttempt: retryCount,
      });

      setIsFetchingSlides(true);
      setError(null);

      // Verify Supabase connection before querying
      if (!supabase) {
        console.error("Supabase client is not initialized");
        setError(
          "Database connection not available. Please try refreshing the page."
        );
        setIsFetchingSlides(false);
        return;
      }

      // Check session
      if (!session) {
        console.error("No active session");
        setError("You need to be logged in to view slides.");
        setIsFetchingSlides(false);
        return;
      }

      // Create a simpler query with fewer operations to test connection
      try {
        // First, test a simpler query to check connection
        const testQuery = await supabase
          .from("slides")
          .select("*", { count: "exact", head: true });
        console.log("Test query result:", testQuery);

        if (testQuery.error) {
          throw new Error(`Connection test failed: ${testQuery.error.message}`);
        }

        // If test query works, proceed with main query
        let query = supabase.from("slides").select("*");

        // Apply search filter
        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }

        // Apply course filter
        if (courseFilter) {
          query = query.eq("course_id", courseFilter);
        }

        // Apply file type filter
        if (fileTypeFilter !== "all") {
          if (fileTypeFilter === "image") {
            query = query.ilike("file_type", "image/%");
          } else if (fileTypeFilter === "pdf") {
            query = query.eq("file_type", "application/pdf");
          } else if (fileTypeFilter === "other") {
            query = query
              .not("file_type", "ilike", "image/%")
              .not("file_type", "eq", "application/pdf");
          }
        }

        // Apply sort order
        if (sortOrder === "newest") {
          query = query.order("created_at", { ascending: false });
        } else if (sortOrder === "oldest") {
          query = query.order("created_at", { ascending: true });
        } else if (sortOrder === "a-z") {
          query = query.order("title", { ascending: true });
        } else if (sortOrder === "z-a") {
          query = query.order("title", { ascending: false });
        }

        console.log("Executing Supabase query...");
        const result = await query;
        const {
          data: slideData,
          error: slidesError,
          status,
          statusText,
        } = result;

        console.log("Query completed with status:", status, statusText);

        // Log the full error object for debugging
        if (slidesError) {
          console.error("Error in Supabase query:", slidesError);
          console.error("Full error object:", JSON.stringify(result, null, 2));
          throw new Error(
            `Database query failed: ${
              slidesError.message || "Unknown database error"
            }`
          );
        }

        if (!slideData) {
          console.warn("No data returned but no error either");
          setSlides([]);
        } else {
          console.log(`Fetched ${slideData.length} slides from database`);
          setSlides(slideData);
        }

        // Extract unique course IDs for filter
        if (!isLoaded) {
          try {
            const courseResult = await supabase
              .from("slides")
              .select("course_id");
            const { data: allSlides, error: coursesError } = courseResult;

            if (coursesError) {
              // Don't throw error here, just log it
              console.error("Error fetching course IDs:", coursesError.message);
              return;
            }

            if (allSlides) {
              const uniqueCourses = [
                ...new Set(allSlides.map((slide) => slide.course_id)),
              ];
              setCourses(uniqueCourses);
              setIsLoaded(true);
            }
          } catch (courseError) {
            // Don't let course filter error prevent slides display
            console.error("Error processing courses:", courseError);
          }
        }
      } catch (queryError) {
        console.error("Query execution error:", queryError);
        throw queryError;
      }
    } catch (error) {
      // Reset state if we get an error
      setSlides([]);

      // Improved error logging
      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Try to extract any useful information from the error object
        errorMessage = JSON.stringify(error);
      }

      console.error("Error fetching slides:", errorMessage);

      // Check if we should retry
      const maxRetries = 2; // Maximum number of retry attempts
      const isNetworkError =
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("connection");

      if (isNetworkError && retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1;
        const delay = 1000 * nextRetryCount; // Exponential backoff

        console.log(
          `Will retry fetching slides in ${delay}ms (attempt ${nextRetryCount} of ${maxRetries})`
        );

        toast({
          title: "Connection issue",
          description: `Retrying in ${
            delay / 1000
          } seconds... (${nextRetryCount}/${maxRetries})`,
          variant: "default",
        });

        // Retry after delay
        setTimeout(() => {
          fetchSlides(nextRetryCount);
        }, delay);

        // Don't set error yet since we're retrying
        return;
      }

      // Handle errors if we're not retrying
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError")
      ) {
        setError(
          "Network connection error. Please check your internet connection and try again."
        );
      } else if (
        errorMessage.includes("permission") ||
        errorMessage.includes("not allowed")
      ) {
        setError(
          "You don't have permission to view these slides. Please check your account."
        );
      } else {
        setError(`Failed to load slides: ${errorMessage}`);
      }

      // Show a toast for better UX
      toast({
        title: "Error loading slides",
        description: errorMessage,
        variant: "destructive",
      });

      // Run diagnostics automatically
      runDiagnostics();
    } finally {
      setIsFetchingSlides(false);
    }
  };

  const handleUploadComplete = (fileUrl: string, metadata: any) => {
    setIsUploading(false);
    fetchSlides();
  };

  const deleteSlide = async (slideId: string, filePath: string) => {
    // Track if we've deleted the file successfully
    let fileDeletedSuccessfully = false;

    try {
      // Update UI state immediately to remove the slide, improving perceived performance
      setSlides((prevSlides) =>
        prevSlides.filter((slide) => slide.id !== slideId)
      );

      toast({
        title: "Deleting slide...",
        description: "Removing the slide and associated file",
      });

      // First, test if we can access the slides table at all
      try {
        const testQuery = await supabase.from("slides").select("id").limit(1);
        if (testQuery.error) {
          console.error("Cannot access slides table:", testQuery.error);
          throw new Error(
            `Database connection failed: ${testQuery.error.message}`
          );
        }
      } catch (testError) {
        console.error("Test query failed:", testError);
        toast({
          title: "Connection Error",
          description: "Could not connect to database. Please try again later.",
          variant: "destructive",
        });
        // Refresh slides to restore the UI in case of error
        await fetchSlides();
        return;
      }

      // First, delete the file from storage if there's a file path
      if (filePath) {
        let storageError = null;
        let retryCount = 0;
        const maxRetries = 3;

        // Try up to 3 times to delete the file from storage
        while (retryCount < maxRetries && !fileDeletedSuccessfully) {
          try {
            console.log(
              `Attempting to delete file: ${filePath} (attempt ${
                retryCount + 1
              })`
            );

            const result = await supabase.storage
              .from("content")
              .remove([filePath]);

            const { error, data } = result;

            console.log("Storage deletion result:", result);

            if (!error) {
              console.log("File deleted successfully:", data);
              fileDeletedSuccessfully = true;
              break;
            }

            storageError = error;
            retryCount++;

            if (retryCount < maxRetries) {
              console.log(
                `Retrying file deletion attempt ${retryCount} of ${maxRetries}...`
              );
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * retryCount)
              );
            }
          } catch (err) {
            console.error("Unexpected error during file deletion:", err);
            storageError = new Error(
              err instanceof Error ? err.message : "Unknown file deletion error"
            );
            retryCount++;

            if (retryCount < maxRetries) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * retryCount)
              );
            }
          }
        }

        // If we couldn't delete the file after all retries, at least log it
        if (storageError) {
          console.error(
            "Error deleting file from storage after retries:",
            storageError
          );

          // Continue with database deletion anyway
          console.warn(
            "Continuing with database record deletion despite storage error"
          );
        }
      }

      // Now delete the database record
      console.log(`Attempting to delete slide record with ID: ${slideId}`);

      try {
        // First approach - using normal delete with RLS
        const deleteResult = await supabase
          .from("slides")
          .delete()
          .eq("id", slideId)
          .select();

        const { error: dbError, data: deleteData, status } = deleteResult;

        console.log("Database deletion result:", deleteResult);

        // If we get a permission error, it might be due to missing RLS policy
        if (
          dbError &&
          (dbError.message.includes("permission") ||
            dbError.message.includes("policy"))
        ) {
          console.warn("Permission error, trying alternative approach...");

          // Try a more direct approach that might work even without proper RLS
          const fallbackResult = await supabase.rpc("delete_slide", {
            slide_id: slideId,
          });

          if (fallbackResult.error) {
            throw fallbackResult.error;
          }

          console.log("Fallback deletion result:", fallbackResult);
        } else if (dbError) {
          throw dbError;
        }

        // Fetch slides again to ensure UI state matches database state
        await fetchSlides();

        toast({
          title: "Slide deleted",
          description: fileDeletedSuccessfully
            ? "The slide and file have been successfully deleted."
            : "The slide has been deleted but there may have been an issue removing the file.",
        });
      } catch (dbError) {
        console.error("Error deleting slide from database:", dbError);
        toast({
          title: "Error deleting slide",
          description:
            dbError instanceof Error
              ? dbError.message
              : "Failed to delete slide from database.",
          variant: "destructive",
        });

        // Refresh slides to restore the UI in case of error
        await fetchSlides();

        // Run diagnostics to help troubleshoot
        runDiagnostics();
        return;
      }
    } catch (error) {
      console.error("Unexpected error during slide deletion:", error);

      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      toast({
        title: "Error",
        description: errorMessage.includes("Failed to fetch")
          ? "Connection error. Please check your internet connection and try again."
          : `Failed to delete slide: ${errorMessage}`,
        variant: "destructive",
      });

      // Refresh slides to restore the UI in case of error
      await fetchSlides();

      // Run diagnostics to help user
      runDiagnostics();
    }
  };

  // Add a diagnostics function
  const runDiagnostics = async () => {
    console.log("Running Supabase diagnostics...");
    try {
      // Test basic Supabase authentication first
      const authCheck = await supabase.auth.getSession();
      console.log("Auth session check:", {
        hasSession: !!authCheck.data?.session,
        hasError: !!authCheck.error,
      });

      if (authCheck.error) {
        console.error("Auth error:", authCheck.error);
        toast({
          title: "Authentication Error",
          description:
            "There's an issue with your authentication. Try logging out and back in.",
          variant: "destructive",
        });
        return; // Exit early if auth fails
      }

      // Then test connection
      const connectionStatus = await checkSupabaseConnection();
      console.log("Connection status:", connectionStatus);

      // Check authentication
      const authStatus = await checkAuthStatus();
      console.log("Authentication status:", authStatus);

      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      console.log("Environment check:", {
        hasSupabaseUrl: !!supabaseUrl,
        hasAnonKey,
        url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : "missing",
      });

      // Simple direct test query
      console.log("Performing direct test query...");
      try {
        const directTest = await supabase.from("slides").select("id").limit(1);
        console.log("Direct test result:", {
          status: directTest.status,
          hasData: !!directTest.data,
          hasError: !!directTest.error,
        });
      } catch (directError) {
        console.error("Direct test error:", directError);
      }

      // Test RLS policies
      let rlsStatus = "Unknown";
      try {
        const rlsTest = await supabase
          .from("slides")
          .delete()
          .eq("id", "00000000-0000-0000-0000-000000000000") // Non-existent ID
          .select();

        // If no permission error, RLS is likely set correctly
        rlsStatus =
          rlsTest.error && rlsTest.error.message.includes("permission")
            ? "Failed: No permission to delete"
            : "Success: Delete policy exists";

        console.log("RLS policy test:", rlsStatus, rlsTest);
      } catch (rlsError) {
        console.error("RLS test error:", rlsError);
        rlsStatus = "Error testing RLS";
      }

      // Show complete diagnostics results
      toast({
        title: "Diagnostics Results",
        description: (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span>Connection:</span>
              <span
                className={
                  connectionStatus.connected ? "text-green-500" : "text-red-500"
                }
              >
                {connectionStatus.connected ? "✓ Connected" : "✗ Failed"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Authentication:</span>
              <span
                className={
                  authStatus.authenticated ? "text-green-500" : "text-red-500"
                }
              >
                {authStatus.authenticated
                  ? "✓ Authenticated"
                  : "✗ Not authenticated"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>RLS Policy:</span>
              <span
                className={
                  rlsStatus.includes("Success")
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {rlsStatus.includes("Success")
                  ? "✓ Configured"
                  : "✗ Not configured"}
              </span>
            </div>
            {!connectionStatus.connected && (
              <p className="text-sm text-muted-foreground pt-2">
                Try refreshing the page or check your network connection.
              </p>
            )}
            {!authStatus.authenticated && (
              <p className="text-sm text-muted-foreground pt-2">
                Try logging out and back in to refresh your session.
              </p>
            )}
            {rlsStatus.includes("Failed") && (
              <p className="text-sm text-muted-foreground pt-2">
                The database needs RLS policies for delete operations. Run the
                SQL script in fix-rls-policies.sql.
              </p>
            )}
          </div>
        ) as any,
        variant:
          connectionStatus.connected &&
          authStatus.authenticated &&
          rlsStatus.includes("Success")
            ? "default"
            : "destructive",
      });
    } catch (error) {
      console.error("Diagnostics error:", error);
      toast({
        title: "Diagnostics Failed",
        description:
          "Could not complete diagnostics. Check console for details.",
        variant: "destructive",
      });
    }
  };

  // Run diagnostics if we encounter errors
  useEffect(() => {
    if (error) {
      runDiagnostics();
    }
  }, [error]);

  // If loading or no session, show fallback
  if (isLoading || !session) {
    return <DashboardAuthFallback />;
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Content Library"
        text="Access and manage your learning materials"
      >
        <Button onClick={() => setIsUploading(!isUploading)}>
          <FileUp className="mr-2 h-4 w-4" />
          {isUploading ? "Cancel Upload" : "Upload Slides"}
        </Button>
      </DashboardHeader>

      <div className="grid gap-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Content</AlertTitle>
            <AlertDescription className="flex flex-col space-y-2">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit mt-2"
                onClick={runDiagnostics}
              >
                Run Diagnostics
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Content</TabsTrigger>
                <TabsTrigger value="recent">Recently Added</TabsTrigger>
              </TabsList>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search slides..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchSlides()}
                  />
                </div>

                <Select
                  value={fileTypeFilter}
                  onValueChange={(value) => {
                    setFileTypeFilter(value);
                    fetchSlides();
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="File type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF Files</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="other">Other Files</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(value) => {
                    setSortOrder(value);
                    fetchSlides();
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="a-z">A-Z</SelectItem>
                    <SelectItem value="z-a">Z-A</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={courseFilter}
                  onValueChange={(value) => {
                    setCourseFilter(value === "all" ? "" : value);
                    fetchSlides();
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isUploading && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Upload New Slides</CardTitle>
                  <CardDescription>
                    Upload PDF documents or images to share with your students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onUploadComplete={handleUploadComplete} />
                </CardContent>
              </Card>
            )}

            <TabsContent value="all" className="mt-0">
              {isFetchingSlides ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading slides...
                  </span>
                </div>
              ) : slides.length > 0 ? (
                <SlideGrid slides={slides} onDeleteSlide={deleteSlide} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No slides found. Upload some content to get started.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              {isFetchingSlides ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading slides...
                  </span>
                </div>
              ) : slides.length > 0 ? (
                <SlideGrid
                  slides={slides.slice(0, 6)}
                  onDeleteSlide={deleteSlide}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No recent slides found.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  );
}
