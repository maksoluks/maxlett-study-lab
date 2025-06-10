
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, PenTool, Shuffle, FileText } from "lucide-react";
import { FlashcardSetData } from "@/pages/Index";

interface FlashcardSetProps {
  set: FlashcardSetData;
  onStudy: (set: FlashcardSetData, mode: 'flashcards' | 'learn' | 'write' | 'match' | 'test') => void;
}

export const FlashcardSet = ({ set, onStudy }: FlashcardSetProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 bg-white/90 backdrop-blur-sm border border-blue-100">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">{set.title}</CardTitle>
        <p className="text-gray-600">{set.description}</p>
        <div className="text-sm text-blue-600 font-medium">
          {set.cards.length} {set.cards.length === 1 ? 'card' : 'cards'}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={() => onStudy(set, 'flashcards')}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Study Flashcards
        </Button>
        <Button
          onClick={() => onStudy(set, 'learn')}
          variant="outline"
          className="w-full border-blue-200 hover:bg-blue-50 transition-colors"
        >
          <Brain className="h-4 w-4 mr-2" />
          Learn Mode
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onStudy(set, 'write')}
            variant="outline"
            size="sm"
            className="border-purple-200 hover:bg-purple-50 text-purple-700"
          >
            <PenTool className="h-3 w-3 mr-1" />
            Write
          </Button>
          <Button
            onClick={() => onStudy(set, 'match')}
            variant="outline"
            size="sm"
            className="border-green-200 hover:bg-green-50 text-green-700"
          >
            <Shuffle className="h-3 w-3 mr-1" />
            Match
          </Button>
          <Button
            onClick={() => onStudy(set, 'test')}
            variant="outline"
            size="sm"
            className="border-orange-200 hover:bg-orange-50 text-orange-700"
          >
            <FileText className="h-3 w-3 mr-1" />
            Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
