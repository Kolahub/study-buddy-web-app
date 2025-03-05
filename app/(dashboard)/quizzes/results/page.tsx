"use client"

import { useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"

export default function QuizResultsPage() {
  const searchParams = useSearchParams()
  const score = searchParams.get("score")
  const total = searchParams.get("total")
  const correct = searchParams.get("correct")

  return (
    <DashboardShell>
      <DashboardHeader heading="Quiz Results" text="See how well you did on the quiz." />

      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Your Score: {score}%</CardTitle>
          <CardDescription>
            You got {correct} out of {total} questions correct
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {Number(score) >= 70 ? (
              <div className="flex flex-col items-center text-green-500">
                <CheckCircle2 className="h-24 w-24" />
                <p className="mt-2 text-lg font-medium">Great job!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-amber-500">
                <XCircle className="h-24 w-24" />
                <p className="mt-2 text-lg font-medium">Keep practicing!</p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your learning classification will be updated based on your quiz performance.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/quizzes">More Quizzes</Link>
          </Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  )
}

