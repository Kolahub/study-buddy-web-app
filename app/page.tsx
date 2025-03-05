import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Brain, CheckCircle, Gauge, Lightbulb, Sparkles, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Study Buddy</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted pt-16 pb-20">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[center_top_-1px] border-b"></div>
        <div className="container relative">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                Learn at <span className="text-primary">your own pace</span>, master any subject
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Study Buddy adapts to your learning style, providing personalized content and recommendations to help
                you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/signup">
                    Sign up and start learning <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">How it works</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-[80%] aspect-video bg-card rounded-lg shadow-lg border flex items-center justify-center">
                  <div className="text-center p-6">
                    <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Interactive Learning</h3>
                    <p className="text-muted-foreground">Engaging content that adapts to your pace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Overview Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center max-w-[800px] mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Personalized Learning for Everyone</h2>
            <p className="text-xl text-muted-foreground">
              Study Buddy is an adaptive learning platform that tailors educational content to your unique learning
              pace, helping you master concepts more effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Adaptive Learning</h3>
              <p className="text-muted-foreground">
                Our system classifies your learning pace and adjusts content difficulty to match your needs.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Interactive Content</h3>
              <p className="text-muted-foreground">
                Engage with dynamic slides and quizzes designed to reinforce key concepts and test your knowledge.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                Receive personalized study suggestions based on your performance to focus your learning effectively.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted">
        <div className="container">
          <div className="text-center max-w-[800px] mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">How Study Buddy Works</h2>
            <p className="text-xl text-muted-foreground">
              Our three-step process adapts to your learning style to provide the most effective educational experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10">
              <div className="bg-background rounded-lg p-8 border shadow-sm h-full">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-6 mx-auto">
                  1
                </div>
                <h3 className="text-xl font-medium mb-4 text-center">Assessment</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Take quizzes to help us understand your current knowledge level and learning speed.
                </p>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gauge className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10">
              <div className="bg-background rounded-lg p-8 border shadow-sm h-full">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-6 mx-auto">
                  2
                </div>
                <h3 className="text-xl font-medium mb-4 text-center">Classification</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Our system classifies your learning pace as Slow, Moderate, or Fast based on your performance.
                </p>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10">
              <div className="bg-background rounded-lg p-8 border shadow-sm h-full">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-6 mx-auto">
                  3
                </div>
                <h3 className="text-xl font-medium mb-4 text-center">Personalization</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Receive tailored content and recommendations optimized for your learning style.
                </p>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center max-w-[800px] mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Benefits for Students</h2>
            <p className="text-xl text-muted-foreground">
              Study Buddy helps you learn more effectively and efficiently with these key advantages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Personalized Learning Path</h3>
                <p className="text-muted-foreground">
                  Content that adapts to your specific learning pace, ensuring you're neither overwhelmed nor bored.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Targeted Recommendations</h3>
                <p className="text-muted-foreground">
                  Smart suggestions for what to study next based on your performance and learning classification.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Visualize your learning journey with detailed analytics and progress reports.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Engaging Content</h3>
                <p className="text-muted-foreground">
                  Interactive slides and quizzes that make learning more enjoyable and effective.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <div className="text-center max-w-[800px] mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-xl text-muted-foreground">
              Hear from students who have transformed their learning experience with Study Buddy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Sarah Johnson</h4>
                  <p className="text-sm text-muted-foreground">Computer Science Student</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Study Buddy helped me understand complex programming concepts at my own pace. The personalized
                recommendations were exactly what I needed to improve."
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Michael Chen</h4>
                  <p className="text-sm text-muted-foreground">Mathematics Major</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The adaptive learning system recognized that I needed more time with calculus concepts but could move
                quickly through algebra. It's like having a tutor who really knows you."
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Emily Rodriguez</h4>
                  <p className="text-sm text-muted-foreground">Biology Student</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I was struggling with certain biology concepts, but Study Buddy identified my learning pace and
                provided content that finally made everything click. My grades have improved significantly!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning Experience?</h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Join thousands of students who are learning at their own pace and achieving better results.
            </p>
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <Link href="/signup">
                Sign Up and Start Learning <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Study Buddy</span>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Study Buddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

