import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, FileText } from "lucide-react"

export default async function QuizzesPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch available quizzes
  const { data: quizzes } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false })

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Quizzes"
        text="Take quizzes to test your knowledge and improve your learning classification."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes?.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{quiz.time_limit} minutes</span>
              </div>
              <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{quiz.question_count} questions</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/quizzes/${quiz.id}`}>Start Quiz</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {!quizzes?.length && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No quizzes available</CardTitle>
              <CardDescription>Check back later for new quizzes.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}

