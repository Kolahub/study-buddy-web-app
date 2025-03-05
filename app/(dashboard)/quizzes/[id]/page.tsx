import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { QuizComponent } from "@/components/quiz/quiz-component"

interface QuizPageProps {
  params: {
    id: string
  }
}

export default async function QuizPage({ params }: QuizPageProps) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch quiz details
  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", params.id).single()

  if (!quiz) {
    redirect("/quizzes")
  }

  // Fetch quiz questions
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", params.id)
    .order("order", { ascending: true })

  return (
    <DashboardShell>
      <DashboardHeader heading={quiz.title} text={quiz.description} />

      <QuizComponent quiz={quiz} questions={questions || []} userId={session.user.id} />
    </DashboardShell>
  )
}

