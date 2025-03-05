import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LineChart, BookOpen, Trophy, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

export const metadata: Metadata = {
  title: "Learning Progress - Study Buddy",
  description: "Track your learning progress and performance",
}

export default async function ProgressPage() {
  const supabase = createServerSupabaseClient()

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Your Learning Progress</h1>
      <ProgressContent userId={session.user.id} />
    </div>
  )
}

async function ProgressContent({ userId }: { userId: string }) {
  const supabase = createServerSupabaseClient()
  
  // Fetch quiz submissions
  let quizzes = []
  try {
    const { data } = await supabase
      .from("quiz_submissions")
      .select("*, quizzes(title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    
    quizzes = data || []
  } catch (error) {
    console.error("Error fetching quiz data:", error)
    quizzes = []
  }
  
  // Fetch content progress
  let contentProgress = []
  try {
    const { data } = await supabase
      .from("content_progress")
      .select("*, slides(title)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
    
    contentProgress = data || []
  } catch (error) {
    console.error("Error fetching content progress:", error)
    contentProgress = []
  }
  
  // Fetch total content items
  let totalContent = 0
  try {
    const { count } = await supabase
      .from("slides")
      .select("*", { count: "exact", head: true })
    
    totalContent = count || 0
  } catch (error) {
    console.error("Error fetching total content:", error)
  }
  
  // Calculate overall progress
  const totalItems = totalContent + (quizzes?.length || 0)
  const completedItems = (contentProgress?.length || 0) + (quizzes?.length || 0)
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  
  // Calculate average quiz score
  const averageScore = quizzes.length 
    ? Math.round(quizzes.reduce((acc, quiz) => acc + quiz.score, 0) / quizzes.length) 
    : 0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <LineChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <Progress value={progressPercentage} className="h-2 my-2" />
            <p className="text-xs text-muted-foreground">
              Completed {completedItems} of {totalItems} items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Completion</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalContent > 0 
                ? Math.round((contentProgress.length / totalContent) * 100) 
                : 0}%
            </div>
            <Progress 
              value={totalContent > 0 ? (contentProgress.length / totalContent) * 100 : 0} 
              className="h-2 my-2" 
            />
            <p className="text-xs text-muted-foreground">
              Completed {contentProgress.length} of {totalContent} slides
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <Progress value={averageScore} className="h-2 my-2" />
            <p className="text-xs text-muted-foreground">
              Completed {quizzes.length} quizzes
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Activity</CardTitle>
            <CardDescription>Your recent quiz submissions and scores</CardDescription>
          </CardHeader>
          <CardContent>
            {quizzes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Time Taken</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.slice(0, 5).map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">
                        {quiz.quizzes?.title || "Unknown Quiz"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{quiz.score}%</span>
                          <Progress value={quiz.score} className="h-2 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{Math.floor(quiz.time_taken / 60)}m {quiz.time_taken % 60}s</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No quiz submissions yet. Start taking quizzes to track your progress!
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Progress</CardTitle>
            <CardDescription>Your progress through course content</CardDescription>
          </CardHeader>
          <CardContent>
            {contentProgress.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Viewed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentProgress.slice(0, 5).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.slides?.title || "Unknown Content"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No content viewed yet. Start exploring our learning materials!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 