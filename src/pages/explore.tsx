import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID } from "@/utils/emailjs";
import { addStoredContactMessage } from "@/utils/localStorageBackup";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Code, MessageCircle, Search, Mail, Phone, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";


// Feature card component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="border-2 border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden group">
    <div className="absolute -right-10 -top-10 w-20 h-20 bg-primary/10 rounded-full group-hover:scale-150 transition-all duration-500"></div>
    <div className="absolute -left-10 -bottom-10 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-150 transition-all duration-500 delay-100"></div>
    <CardHeader className="relative z-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-white transform group-hover:rotate-3 group-hover:scale-110">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </div>
      <CardDescription className="text-base">{description}</CardDescription>
    </CardHeader>
  </Card>
);

// Testimonial card component
const TestimonialCard = ({ name, role, content, avatar }: { name: string, role: string, content: string, avatar: string }) => (
  <Card className="border-2 border-gray-100 dark:border-gray-800">
    <CardContent className="p-6">
      <div className="flex gap-4 items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
          {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/20" />}
        </div>
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{role}</p>
        </div>
      </div>
      <p className="italic text-gray-700 dark:text-gray-300">{content}</p>
    </CardContent>
  </Card>
);

// How to use step component
const HowToUseStep = ({ number, title, description }: { number: number, title: string, description: string }) => (
  <div className="flex gap-6 group">
    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-110 relative">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-500 animate-pulse opacity-50 blur-sm group-hover:opacity-80"></div>
      <span className="relative z-10">{number}</span>
    </div>
    <div className="pt-2">
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-lg">{description}</p>
    </div>
  </div>
);

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm();
  const { register: registerSignUp, handleSubmit: handleSignUpSubmit, formState: { errors: signUpErrors } } = useForm();
  const { register: registerContact, handleSubmit: handleContactSubmit, reset: resetContactForm } = useForm();

  const onLoginSubmit = (data: any) => {
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login successful!");
      setIsAuthModalOpen(false);
      navigate("/");
    }, 1500);
  };

  const onSignUpSubmit = (data: any) => {
    setIsLoading(true);
    // Simulate sign up
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created successfully!");
      setIsAuthModalOpen(false);
      navigate("/");
    }, 1500);
  };

  const onContactSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID, // Service ID
        EMAILJS_CONTACT_TEMPLATE_ID, // Template ID
        {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message
        }
      );
      
      console.log('Contact form data sent:', data);
      toast.success("Message sent! We'll get back to you soon.");
      resetContactForm();
    } catch (error) {
      console.error('Failed to send contact form:', error);
      // Log the form data so it's not lost even if EmailJS fails
      console.log('Contact form data (saved despite error):', data);
      
      // Store the form data in localStorage as a backup using our utility function
      addStoredContactMessage(data);
      
      toast.error("Message saved locally. We'll process it when connection is restored.");
      resetContactForm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-32 left-10 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 right-1/3 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -top-40 -right-20 w-80 h-80 border border-purple-200 dark:border-purple-800 rounded-full"></div>
        <div className="absolute top-40 -left-20 w-60 h-60 border border-pink-200 dark:border-pink-800 rounded-full"></div>
        <div className="hidden md:block absolute top-1/3 left-1/3 w-40 h-40 border border-blue-200 dark:border-blue-800 rounded-full"></div>
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-purple-400 dark:bg-purple-600 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-1/3 w-3 h-3 bg-pink-400 dark:bg-pink-600 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-blue-400 dark:bg-blue-600 rounded-full animate-pulse animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 pt-20">
        <div className="container mx-auto max-w-6xl p-0">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex justify-center items-center select-none">
              Build with<span className="text-black dark:text-white">
                <img src="/public/orion-white.png" className="hidden dark:block h-52 w-52 translate-y-3 select-none pointer-events-none" alt="Orion" />
                <img src="/public/orion-black.png" className="dark:hidden h-52 w-52 translate-y-3 select-none pointer-events-none" alt="Orion" />
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
              From idea to app in seconds, with your personal full stack AI engineer
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/")}
                className="px-8 py-6 text-lg"
              >
                Start Building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  setIsSignUp(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-8 py-6 text-lg border-2"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative" id="features">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70">
          <div className="absolute right-0 top-20 w-80 h-80 border border-purple-200 dark:border-purple-800 rounded-full opacity-20"></div>
          <div className="absolute left-10 bottom-10 w-60 h-60 border border-blue-200 dark:border-blue-800 rounded-full opacity-20"></div>
          <div className="absolute top-40 left-1/3 w-4 h-4 bg-pink-400 dark:bg-pink-600 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-purple-400 dark:bg-purple-600 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 right-1/4 w-5 h-5 bg-blue-400 dark:bg-blue-600 rounded-full animate-pulse animation-delay-4000"></div>
          <div className="hidden md:block absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full opacity-30 mix-blend-multiply dark:mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl px-0 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-primary to-purple-600">Why Choose Orion</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">Powerful AI features to supercharge your development workflow</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Code className="h-6 w-6 text-primary" />}
              title="AI Code Generation"
              description="Generate high-quality code for any project with our advanced AI models."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-6 w-6 text-green-500" />}
              title="100% Free"
              description="All core features are completely free to use, no hidden charges."
            />
            <FeatureCard 
              icon={<MessageCircle className="h-6 w-6 text-blue-500" />}
              title="Real-time Chat"
              description="Interact with our AI in real-time to refine your projects and get instant feedback."
            />
            <FeatureCard 
              icon={<Search className="h-6 w-6 text-yellow-500" />}
              title="Multiple AI Models"
              description="Choose from various AI models including GPT-4, DeepSeek, Llama, Gemini and many more with automated failover."
            />
            <FeatureCard 
              icon={<ArrowRight className="h-6 w-6 text-purple-500" />}
              title="Quick Prototyping"
              description="Go from concept to working prototype in minutes, not days or weeks."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-6 w-6 text-indigo-500" />}
              title="Modern Tech Stack"
              description="Build with the latest technologies including React, Tailwind, and more."
            />
          </div>
        </div>
      </section>

      {/* How To Use Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 top-40 w-[600px] h-[600px] border border-gray-200 dark:border-gray-700 rounded-full opacity-20 animate-float"></div>
          <div className="absolute -left-10 top-20 w-[300px] h-[300px] border-2 border-gray-200 dark:border-gray-700 rounded-full opacity-20 animate-float animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] border border-gray-200 dark:border-gray-700 rounded-full opacity-10 animate-float animation-delay-4000"></div>
          <svg className="absolute right-0 bottom-0 w-64 h-64 text-primary/5" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M37,-65.1C47.2,-58,54.8,-45.9,62.5,-33.2C70.1,-20.6,77.8,-7.3,77.2,5.7C76.7,18.6,68,31.2,58.6,43.6C49.3,56.1,39.3,68.3,26.9,73.4C14.5,78.5,-0.4,76.5,-14.9,73C-29.5,69.5,-43.5,64.6,-56.5,55.7C-69.5,46.8,-81.5,33.9,-83.9,19.1C-86.3,4.3,-79.2,-12.3,-71.5,-27.4C-63.8,-42.4,-55.6,-55.9,-43.8,-62.4C-32.1,-69,-16,-68.7,-1.2,-66.7C13.7,-64.7,27.4,-61.1,37,-65.1Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute left-0 top-0 w-64 h-64 text-indigo-500/5" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M31.9,-54.4C38.4,-44.3,38.6,-30.4,43.9,-18.8C49.2,-7.2,59.5,2.1,62.3,13.6C65.1,25,60.3,38.5,50.6,46.4C41,54.3,26.5,56.6,12.7,58.9C-1.1,61.3,-14.2,63.7,-26.1,60.4C-38,57,-48.7,47.9,-53.5,36.5C-58.3,25.1,-57.3,11.3,-55.9,-1.4C-54.5,-14.1,-52.7,-25.8,-46.6,-35.3C-40.5,-44.8,-30.1,-52.2,-19.3,-57.4C-8.5,-62.6,2.8,-65.7,12.9,-63.1C22.9,-60.6,32.3,-52.5,31.9,-44.4Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="container mx-auto max-w-4xl px-2 flex flex-col items-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-primary to-purple-500">How To Use Orion</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-16 max-w-xl mx-auto">Follow these simple steps to create amazing applications with AI</p>
          
          <div className="space-y-8">
            <HowToUseStep 
              number={1}
              title="Describe Your Project"
              description="Tell Orion what you want to build using natural language. Be as specific or as vague as you like."
            />
            <HowToUseStep 
              number={2}
              title="Review & Refine"
              description="Orion will generate code based on your description. Review it and ask for refinements if needed."
            />
            <HowToUseStep 
              number={3}
              title="Export & Use"
              description="Once you're happy with the result, export the code and use it in your own projects."
            />
            <HowToUseStep 
              number={4}
              title="Build Amazing Things"
              description="Use Orion to build websites, apps, components, or anything else you can imagine."
            />
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate("/")}
              className="px-6 py-2"
            >
              Try It Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What People Are Saying</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard 
              name="Alex Johnson"
              role="Frontend Developer"
              content="Orion helped me build a complex UI in minutes that would've taken days otherwise. The code quality is impressive!"
              avatar=""
            />
            <TestimonialCard 
              name="Sarah Miller"
              role="Product Manager"
              content="We use Orion to quickly prototype new features. It's become an essential part of our development workflow."
              avatar=""
            />
            <TestimonialCard 
              name="Michael Chen"
              role="Startup Founder"
              content="As a non-technical founder, Orion has been a game-changer. I can now bring my ideas to life without hiring a developer."
              avatar=""
            />
          </div>
        </div>
      </section> */}

      {/* Contact Section */}
      <section className="py-20 px-2 bg-gray-50 dark:bg-gray-900 relative overflow-hidden" id="contact">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="hidden md:block absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full filter blur-3xl opacity-70"></div>
          <div className="hidden md:block absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-primary/10 rounded-full filter blur-3xl opacity-70"></div>
          <div className="absolute top-1/4 left-10 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-10 w-3 h-3 bg-purple-500 rounded-full animate-pulse animation-delay-2000"></div>
          
          {/* Decorative icons */}
          <div className="absolute top-20 left-1/4 opacity-5">
            <Mail className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute bottom-20 right-1/4 opacity-5">
            <Phone className="w-16 h-16 text-purple-500" />
          </div>
          <div className="absolute top-1/2 right-20 opacity-5">
            <MapPin className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        
        <div className="container mx-auto max-w-4xl px-0 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-primary to-indigo-500">Get In Touch</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-xl mx-auto">Have questions or feedback? We'd love to hear from you!</p>
          
          <div className="flex justify-center">
            
            <div>
              <Card className="border-2 border-gray-100 dark:border-gray-800">
                <CardContent className="p-6">
                  <form onSubmit={handleContactSubmit(onContactSubmit)}>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" placeholder="Your name" {...registerContact("name", { required: "Name is required" })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Your email" {...registerContact("email", { required: "Email is required" })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="How can we help you?" {...registerContact("subject", { required: "Subject is required" })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <textarea 
                          id="message"
                          className="w-full min-h-[120px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950" 
                          placeholder="Tell us more about your request..."
                          {...registerContact("message", { required: "Message is required" })}
                        ></textarea>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            <span>Sending...</span>
                          </div>
                        ) : "Send Message"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl px-2">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Orion</h3>
              <p className="text-gray-600 dark:text-gray-400">Your AI-powered code generation assistant.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary">Home</Link></li>
                <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-primary">Features</a></li>
                <li><a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-primary">Contact</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} Orion. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-[425px] border-2 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{isSignUp ? "Create an Account" : "Sign In to Orion"}</DialogTitle>
          </DialogHeader>
          
          {isSignUp ? (
            <form onSubmit={handleSignUpSubmit(onSignUpSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...registerSignUp("name", { required: "Name is required" })}
                />
                {signUpErrors.name && (
                  <p className="text-sm text-red-500">{signUpErrors.name.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailSignUp">Email</Label>
                <Input
                  id="emailSignUp"
                  type="email" 
                  placeholder="your@email.com"
                  {...registerSignUp("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
                {signUpErrors.email && (
                  <p className="text-sm text-red-500">{signUpErrors.email.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordSignUp">Password</Label>
                <Input 
                  id="passwordSignUp"
                  type="password"
                  {...registerSignUp("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                />
                {signUpErrors.password && (
                  <p className="text-sm text-red-500">{signUpErrors.password.message as string}</p>
                )}
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : "Sign Up"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email" 
                  placeholder="your@email.com"
                  {...registerLogin("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
                {loginErrors.email && (
                  <p className="text-sm text-red-500">{loginErrors.email.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password"
                  {...registerLogin("password", { required: "Password is required" })}
                />
                {loginErrors.password && (
                  <p className="text-sm text-red-500">{loginErrors.password.message as string}</p>
                )}
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : "Sign In"}
                </Button>
              </DialogFooter>
            </form>
          )}
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? "Already have an account?" : "New user?"} 
              <button 
                className="text-primary hover:underline ml-1" 
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExplorePage;
