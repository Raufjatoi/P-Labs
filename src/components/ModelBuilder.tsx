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
    <section id="model-builder" className="py-20 px-4 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Build Your ML Model
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your machine learning idea and we'll generate the Python code for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Describe Your Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="E.g., I want to predict house prices based on location, size, and age..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-accent"
                />
                
                 <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating || (user?.plan === 'free' && user.apiCallsUsed >= user.apiCallsLimit)}
                    className="flex-1"
                    variant="hero"
                  >
                    {!user ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Sign In Required
                      </>
                    ) : user.plan === 'free' && user.apiCallsUsed >= user.apiCallsLimit ? (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </>
                    ) : isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate Model
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon" className="sm:w-auto w-full">
                    <Upload className="w-4 h-4" />
                    <span className="sm:hidden ml-2">Upload Data</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setPrompt(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Sections */}
          <div className="space-y-6">
            {/* Explanation Section */}
            {explanationText && (
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent>
             <div className="prose prose-sm max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-purple-400" {...props} />,
      h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-pink-300" {...props} />,
      p: ({node, ...props}) => <p className="text-muted-foreground leading-relaxed" {...props} />,
      code: ({node, inline, ...props}) =>
        inline ? (
          <code className="bg-muted px-1 py-0.5 rounded text-blue-300" {...props} />
        ) : (
          <code className="block bg-muted p-3 rounded-lg text-blue-300 overflow-x-auto" {...props} />
        )
    }}
  >
    {explanationText}
  </ReactMarkdown>
</div>

                </CardContent>
              </Card>
            )}

            {/* Code Section */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Python Code
                  </span>
                  {generatedCode && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedCode ? (
                  <div className="rounded-lg overflow-hidden">
                    <SyntaxHighlighter
                      language="python"
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                      showLineNumbers={true}
                      wrapLines={true}
                      wrapLongLines={true}
                    >
                      {generatedCode}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated ML model code will appear here.</p>
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
