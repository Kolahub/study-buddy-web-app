export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      classifications: {
        Row: {
          id: string
          user_id: string
          classification: "Slow" | "Moderate" | "Fast"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          classification: "Slow" | "Moderate" | "Fast"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          classification?: "Slow" | "Moderate" | "Fast"
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string
          time_limit: number
          question_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          time_limit: number
          question_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          time_limit?: number
          question_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question_text?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_answer?: string
          order?: number
          created_at?: string
        }
      }
      quiz_submissions: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          time_taken: number
          answers: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score: number
          time_taken: number
          answers: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          score?: number
          time_taken?: number
          answers?: Json
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          title: string
          description: string
          classification: "Slow" | "Moderate" | "Fast"
          content_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          classification: "Slow" | "Moderate" | "Fast"
          content_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          classification?: "Slow" | "Moderate" | "Fast"
          content_id?: string
          created_at?: string
        }
      }
    }
  }
}

