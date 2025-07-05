import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Brain, Volume2, MessageSquare, ArrowRight } from 'lucide-react';

export const SaathiDemo = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Meet SAATHI
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your AI voice companion that understands and responds naturally. 
            Have real conversations, get instant answers, and experience the future of voice interaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => window.location.href = '/saathi'}
            >
              <Mic className="h-5 w-5 mr-2" />
              Try SAATHI Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/saathi'}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice Recognition</h3>
              <p className="text-gray-600">
                Advanced speech recognition that understands natural language and multiple accents.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Intelligence</h3>
              <p className="text-gray-600">
                Powered by cutting-edge AI that provides contextual and intelligent responses.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Volume2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Natural Speech</h3>
              <p className="text-gray-600">
                Human-like voice synthesis that sounds natural and engaging.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 