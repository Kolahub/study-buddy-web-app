"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/provider"
import { Clock } from "lucide-react"

interface QuizComponentProps {
  quiz: any
  questions: any[]
  userId: string
}

export function QuizComponent({ quiz, questions, userId }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Calculate score
      let correctAnswers = 0
      questions.forEach((question) => {
        if (answers[question.id] === question.correct_answer) {
          correctAnswers++
        }
      })

      const score = Math.round((correctAnswers / questions.length) * 100)

      // Submit quiz results
      const { error } = await supabase.from("quiz_submissions").insert([
        {
          user_id: userId,
          quiz_id: quiz.id,
          score,
          time_taken: quiz.time_limit * 60 - timeLeft,
          answers: answers,
        },
      ])

      if (error) {
        throw error
      }

      toast({
        title: "Quiz submitted",
        description: `Your score: ${score}%`,
      })

      // Redirect to results page
      router.push(`/quizzes/results?score=${score}&total=${questions.length}&correct=${correctAnswers}`)
    } catch (error: any) {
      toast({
        title: "Error submitting quiz",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!questions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No questions available</CardTitle>
          <CardDescription>This quiz doesn't have any questions yet.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/quizzes")}>Back to Quizzes</Button>
        </CardFooter>
      </Card>
    )
  }

  const question = questions[currentQuestion]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Question {currentQuestion + 1} of {questions.length}
          </CardTitle>
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
        <CardDescription>Select the best answer for each question</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-lg font-medium">{question.question_text}</div>
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {["option_a", "option_b", "option_c", "option_d"].map(
              (option, index) =>
                question[option] && (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.slice(-1)} id={`${question.id}-${option}`} />
                    <Label htmlFor={`${question.id}-${option}`}>{question[option]}</Label>
                  </div>
                ),
            )}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestion === 0}>
          Previous
        </Button>
        <div className="flex space-x-2">
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmitQuiz} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>Next</Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

