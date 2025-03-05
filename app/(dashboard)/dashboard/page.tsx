import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardAuthFallback } from "@/components/dashboard/auth-fallback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ArrowRight, BookOpen, Clock, Trophy } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Loader2 } from "lucide-react"

// Loading component for Suspense
function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Loading your dashboard..." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  )
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}

// Separate async component to handle data fetching
async function DashboardContent() {
  const supabase = createServerSupabaseClient()

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, use client-side fallback
  if (!session) {
    return <DashboardAuthFallback />
  }

  // Fetch user profile
  let profile = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    profile = data;
  } catch (error) {
    profile = null;
  }

  // Fetch user's learning classification
  let classification = null;
  try {
    const { data } = await supabase
      .from("classifications")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    classification = data;
  } catch (error) {
    classification = null;
  }

  // Fetch recent quizzes
  let recentQuizzes = [];
  try {
    const { data } = await supabase
      .from("quiz_submissions")
      .select("*, quizzes(title)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(3);
    recentQuizzes = data || [];
  } catch (error) {
    recentQuizzes = [];
  }

  // Fetch recommended content based on classification
  let recommendations = [];
  try {
    const { data } = await supabase
      .from("recommendations")
      .select("*")
      .eq("classification", classification?.classification || "Moderate")
      .limit(3);
    recommendations = data || [];
  } catch (error) {
    recommendations = [];
  }

  // Calculate course progress based on completed content and quizzes
  let progressPercentage = 0;
  try {
    // Fetch total content items
    const { data: totalContent } = await supabase
      .from("slides")
      .select("id", { count: "exact" });
    
    // Fetch completed content items
    const { data: completedContent } = await supabase
      .from("content_progress")
      .select("*")
      .eq("user_id", session.user.id);
    
    // Calculate progress percentage
    const totalItems = (totalContent?.length || 0) + (recentQuizzes?.length || 0);
    const completedItems = (completedContent?.length || 0) + (recentQuizzes?.length || 0);
    
    if (totalItems > 0) {
      progressPercentage = Math.round((completedItems / totalItems) * 100);
    }
  } catch (error) {
    console.error("Error calculating progress:", error);
    progressPercentage = 0;
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text={`Welcome back, ${profile?.name || "Student"}!`} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Speed</CardTitle>
            <div className="h-4 w-4 text-primary">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classification?.classification || "Moderate"}</div>
            <p className="text-xs text-muted-foreground">Based on your quiz performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
            <div className="h-4 w-4 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentQuizzes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Keep going to improve your classification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentQuizzes?.length
                ? Math.round(recentQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) / recentQuizzes.length)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Your quiz performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
            <div className="h-4 w-4 text-primary">
              <ArrowRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              <a href="/progress" className="text-primary hover:underline">View detailed progress →</a>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recommended Content</CardTitle>
            <CardDescription>
              Based on your {classification?.classification || "Moderate"} learning speed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations?.length ? (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-start space-x-4">
                    <div className="rounded-md bg-primary/10 p-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{rec.title}</p>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/content/${rec.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete more quizzes to get personalized recommendations.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Quizzes</CardTitle>
            <CardDescription>Your latest quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentQuizzes?.length ? (
              <div className="space-y-4">
                {recentQuizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{quiz.quizzes?.title || "Quiz"}</p>
                      <p className="text-sm text-muted-foreground">{new Date(quiz.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${
                          quiz.score >= 70 ? "text-green-500" : quiz.score >= 50 ? "text-amber-500" : "text-red-500"
                        }`}
                      >
                        {quiz.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You haven't taken any quizzes yet. Start learning to see your progress!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

