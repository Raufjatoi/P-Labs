import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Send, Copy, Download, RefreshCw, Code, Lock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const ModelBuilder = () => {
  const { user, session, refreshUserProfile } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const { toast } = useToast();

  // Function to separate text and code from the response
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

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate models.",
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

    if (!prompt.trim()) return;
    
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
              content: `You are an expert ML engineer. Generate complete, production-ready Python code for machine learning models. 

REQUIREMENTS:
1. Always include necessary imports at the top
2. Generate complete, runnable code with proper error handling
3. Include data loading, preprocessing, model training, evaluation, and prediction functions
4. Add clear comments explaining each step
5. Use appropriate libraries (scikit-learn, pandas, numpy, matplotlib, seaborn as needed)
6. Format code properly with proper indentation
7. Include sample usage in main block

Generate step-by-step implementation with all necessary components.`
            },
            {
              role: 'user',
              content: `Create a machine learning model for: ${prompt}

Please generate complete Python code that includes:
- All necessary imports
- Data loading and preprocessing functions
- Model training and evaluation
- Prediction functions
- Proper error handling
- Clear documentation

Make it production-ready and well-structured.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const data = await response.json();
      const rawResponse = data.choices[0]?.message?.content || 'No code generated';
      
      const parsed = parseResponse(rawResponse);
      setGeneratedCode(parsed.code);
      setExplanationText(parsed.explanation);
      
      // Update API usage in database
      if (user && session?.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            api_calls_used: user.apiCallsUsed + 1 
          })
          .eq('user_id', session.user.id);

        if (updateError) {
          console.error('Error updating API usage:', updateError);
        } else {
          // Refresh user profile to get updated data
          await refreshUserProfile();
        }
      }
      
      toast({
        title: "Model Generated!",
        description: `Your ML model has been created successfully. ${user?.plan === 'free' ? `(${user.apiCallsUsed}/${user.apiCallsLimit} calls used)` : ''}`,
      });
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Code Copied!",
      description: "The generated code has been copied to your clipboard.",
    });
  };

  const handleDownload = () => {
    if (!generatedCode) {
      toast({
        title: "No Code to Download",
        description: "Please generate a model first before downloading.",
        variant: "destructive",
      });
      return;
    }

    // Create a blob with the generated code
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ml_model.py';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code Downloaded!",
      description: "The generated code has been downloaded as ml_model.py",
    });
  };

  const suggestions = [
    "Predict house prices based on location and size",
    "Classify images of cats and dogs",
    "Analyze customer sentiment from reviews",
    "Forecast stock prices using historical data",
    "Detect fraud in credit card transactions"
  ];

  return (
    <section id="model-builder" className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3 sm:mb-4 px-2">
            Build Your ML Model
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Describe your machine learning idea and we'll generate the Python code for you.
          </p>
        </div>

        {/* Main Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Input Section - Mobile First Design */}
          <div className="order-1 xl:order-1">
            <Card className="shadow-card border-0 h-fit">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Describe Your Model</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  {/* Textarea - Mobile Optimized */}
                  <Textarea
                    placeholder="E.g., I want to predict house prices based on location, size, and age..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] sm:min-h-[120px] md:min-h-[140px] resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-accent text-sm sm:text-base"
                    rows={4}
                  />
                  
                  {/* Action Buttons - Fully Responsive */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating || (user?.plan === 'free' && user.apiCallsUsed >= user.apiCallsLimit)}
                      className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                      variant="hero"
                    >
                      {!user ? (
                        <>
                          <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Sign In Required</span>
                        </>
                      ) : user.plan === 'free' && user.apiCallsUsed >= user.apiCallsLimit ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Upgrade Plan</span>
                        </>
                      ) : isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                          <span className="truncate">Generating...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Generate Model</span>
                        </>
                      )}
                    </Button>
                    <Button 
  variant="outline" 
  disabled
  className="sm:w-auto w-full h-10 sm:h-11 text-sm sm:text-base opacity-60 cursor-not-allowed"
>
  <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
  <span className="truncate">Files upload soon</span>
</Button>

                  </div>
                </div>

                {/* Suggestions - Mobile Optimized */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-xs sm:text-sm py-1 px-2 sm:py-1.5 sm:px-3 leading-tight"
                        onClick={() => setPrompt(suggestion)}
                      >
                        <span className="line-clamp-2 text-center">{suggestion}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Sections - Mobile Optimized */}
          <div className="order-2 xl:order-2 space-y-4 sm:space-y-6">
            {/* Explanation Section - Mobile First */}
            {explanationText && (
              <Card className="shadow-card border-0">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">Explanation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm sm:prose-base max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold text-purple-400 mb-3" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-semibold text-pink-300 mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-semibold text-pink-300 mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-muted-foreground leading-relaxed mb-3 text-sm sm:text-base" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm sm:text-base" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm sm:text-base" {...props} />,
                        li: ({node, ...props}) => <li className="text-muted-foreground" {...props} />,
                        code: ({node, inline, ...props}) =>
                          inline ? (
                            <code className="bg-muted px-1 py-0.5 rounded text-blue-300 text-xs sm:text-sm" {...props} />
                          ) : (
                            <code className="block bg-muted p-2 sm:p-3 rounded-lg text-blue-300 overflow-x-auto text-xs sm:text-sm" {...props} />
                          ),
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground mb-3" {...props} />,
                      }}
                    >
                      {explanationText}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Code Section - Mobile Optimized */}
            <Card className="shadow-card border-0">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center gap-2 text-lg sm:text-xl">
                    <Code className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">Python Code</span>
                  </span>
                  {generatedCode && (
                    <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCopy}
                        className="flex-1 xs:flex-none text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Copy Code</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDownload}
                        className="flex-1 xs:flex-none text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Download</span>
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedCode ? (
                  <div className="rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        language="python"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                          fontSize: window.innerWidth < 640 ? '0.75rem' : '0.875rem',
                          lineHeight: window.innerWidth < 640 ? '1.4' : '1.5',
                          padding: window.innerWidth < 640 ? '0.75rem' : '1rem',
                        }}
                        showLineNumbers={true}
                        wrapLines={true}
                        wrapLongLines={true}
                        lineNumberStyle={{
                          minWidth: window.innerWidth < 640 ? '2em' : '2.5em',
                          fontSize: window.innerWidth < 640 ? '0.7rem' : '0.8rem',
                        }}
                      >
                        {generatedCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-6 sm:p-8 text-center text-muted-foreground">
                    <Code className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Your generated ML model code will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelBuilder;