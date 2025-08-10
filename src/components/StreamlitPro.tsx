import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Unlock, Sparkles, Code, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const StreamlitPro = () => {
  const { user, session, refreshUserProfile } = useAuth();
  const [secretCode, setSecretCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [appType, setAppType] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const parseResponse = (response: string) => {
    const codeBlockRegex = /```(?:python)?\n?([\s\S]*?)\n?```/g;
    const codeBlocks: string[] = [];
    let match;
    
    // Extract all code blocks
    while ((match = codeBlockRegex.exec(response)) !== null) {
      codeBlocks.push(match[1].trim());
    }
    
    // Remove code blocks from text to get explanation
    const textWithoutCode = response.replace(codeBlockRegex, '').trim();
    
    return {
      code: codeBlocks.join('\n\n'),
      explanation: textWithoutCode
    };
  };

  const generateStreamlitApp = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate Streamlit apps.",
        variant: "destructive",
      });
      return;
    }

    if (user.plan === 'free' && user.apiCallsUsed >= user.apiCallsLimit) {
      toast({
        title: "API limit reached",
        description: "You've reached your monthly limit. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim() || !appType) {
      toast({
        title: "Missing Information",
        description: "Please provide both a description and select an app type.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'compound-beta',
          messages: [
            {
              role: 'system',
              content: `You are a Streamlit expert. Generate complete, production-ready Streamlit applications. 

REQUIREMENTS:
1. Always include necessary imports at the top (streamlit, pandas, numpy, etc.)
2. Generate complete, runnable Streamlit code with proper structure
3. Include proper Streamlit components (st.title, st.sidebar, st.columns, etc.)
4. Add interactive elements like buttons, sliders, file uploaders as appropriate
5. Include data processing and visualization with plotly or matplotlib
6. Add clear comments explaining each section
7. Make it fully functional and ready to run with 'streamlit run app.py'
8. Include sample data or data generation if needed
9. Use modern Streamlit features and best practices
10. Make it visually appealing with proper layout

Generate a complete, functional Streamlit application.`
            },
            {
              role: 'user',
              content: `Create a ${appType} Streamlit application: ${prompt}

Requirements:
- Complete Python code that works with 'streamlit run'
- Include all necessary imports
- Add interactive components
- Include sample data or data generation
- Make it visually appealing
- Add proper error handling
- Include explanatory text and documentation`
            }
          ],
          temperature: 0.3,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Streamlit app');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      const { code, explanation } = parseResponse(content);
      setGeneratedCode(code);
      setExplanationText(explanation);

      // Update API usage in database and save generation
      if (user && session?.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            api_calls_used: user.apiCallsUsed + 1 
          })
          .eq('user_id', session.user.id);

        if (updateError) {
          console.error('Error updating API usage:', updateError);
        }

        // Save the generation to database
        const { error: saveError } = await supabase
          .from('model_generations')
          .insert({
            user_id: session.user.id,
            model_name: `${appType} Streamlit App`,
            model_type: 'streamlit',
            description: prompt,
            code_generated: code,
            is_streamlit: true
          });

        if (saveError) {
          console.error('Error saving generation:', saveError);
        }

        // Refresh user profile to get updated data
        await refreshUserProfile();
      }

      toast({
        title: "Streamlit App Generated! 🎉",
        description: `Your ${appType} application is ready. ${user?.plan === 'free' ? `(${user.apiCallsUsed + 1}/${user.apiCallsLimit} calls used)` : ''}`,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate Streamlit app. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Code Copied! 📋",
      description: "Code has been copied to clipboard.",
    });
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'streamlit_app.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File Downloaded! 📥",
      description: "streamlit_app.py has been downloaded.",
    });
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handleUnlock = () => {
    if (secretCode.trim() === "rauf21") {
      setIsUnlocked(true);
      toast({
        title: "Streamlit Pro Unlocked! 🎉",
        description: "You now have access to advanced Streamlit features.",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please check your secret code and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="streamlit-pro" className="py-20 px-4 bg-gradient-to-br from-pink-accent/20 to-accent/20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Unlock Streamlit Pro
          </h2>
          <p className="text-xl text-muted-foreground mb-4">
            Convert your ML models into interactive web applications with advanced Streamlit features.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800 text-center">
              ⚠️ <strong>Limited Access:</strong> This feature is under development. Only select users can access it. 
              Contact <a href="https://raufjatoi.vercel.app" className="text-primary hover:underline font-medium">Rauf</a> for the access code.
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                {isUnlocked ? (
                  <>
                    <Unlock className="w-5 h-5 text-green-500" />
                    <span className="text-green-500">Pro Features Unlocked!</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Enter Secret Code
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isUnlocked ? (
                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Enter your secret code..."
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="text-center text-lg font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnlock();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleUnlock}
                    className="w-full"
                    variant="hero"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Pro Features
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-primary rounded-lg text-white">
                    <Sparkles className="w-8 h-8 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to Streamlit Pro!</h3>
                    <p className="text-sm opacity-90">
                      You now have access to advanced features including interactive dashboards, 
                      real-time data visualization, and custom deployment options.
                    </p>
                  </div>
                  
                  <div className="grid gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Interactive Streamlit Apps</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Real-time Data Visualization</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Custom Deployment Options</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Advanced Model Monitoring</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => setShowBuilder(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Streamlit App
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Streamlit App Builder */}
        {showBuilder && isUnlocked && (
          <div className="mt-12 max-w-6xl mx-auto">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Streamlit App Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">App Type</label>
                      <Select value={appType} onValueChange={setAppType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select app type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dashboard">Dashboard App</SelectItem>
                          <SelectItem value="ml-model">ML Model Interface</SelectItem>
                          <SelectItem value="data-visualization">Data Visualization</SelectItem>
                          <SelectItem value="calculator">Calculator Tool</SelectItem>
                          <SelectItem value="chatbot">Chatbot Interface</SelectItem>
                          <SelectItem value="form">Form Builder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        placeholder="Describe your Streamlit app in detail..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    
                    <Button 
                      onClick={generateStreamlitApp}
                      disabled={!user || isGenerating || !prompt.trim() || !appType || (user?.plan === 'free' && user.apiCallsUsed >= user.apiCallsLimit)}
                      className="w-full"
                      variant="pro"
                    >
                      {!user ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Sign In Required
                        </>
                      ) : user.plan === 'free' && user.apiCallsUsed >= user.apiCallsLimit ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Upgrade Plan
                        </>
                      ) : isGenerating ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Streamlit App
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {explanationText && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Explanation</h3>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-purple-400" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-pink-300" {...props} />,
                              p: ({node, ...props}) => <p className="text-muted-foreground leading-relaxed" {...props} />,
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ borderRadius: "0.5rem", padding: "1rem" }}
                                  >
                                    {String(children).replace(/\n$/, "")}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {explanationText}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {generatedCode && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold">Python Code</h3>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={copyCode}>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button size="sm" variant="outline" onClick={downloadCode}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto border rounded-lg">
                          <SyntaxHighlighter
                            language="python"
                            style={tomorrow}
                            showLineNumbers={true}
                            wrapLines={true}
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              padding: '1rem'
                            }}
                          >
                            {generatedCode}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default StreamlitPro;