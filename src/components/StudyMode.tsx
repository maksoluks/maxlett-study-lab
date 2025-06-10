
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { FlashcardSetData, Flashcard } from "@/pages/Index";

interface StudyModeProps {
  set: FlashcardSetData;
  mode: 'flashcards' | 'learn';
  onBack: () => void;
}

export const StudyMode = ({ set, mode, onBack }: StudyModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [incorrectCards, setIncorrectCards] = useState<Flashcard[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentCards = mode === 'learn' && incorrectCards.length > 0 ? incorrectCards : set.cards;
  const currentCard = currentCards[currentIndex];
  const progress = (studiedCards.size / set.cards.length) * 100;

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setIncorrectCards([]);
    setIsComplete(false);
  }, [set, mode]);

  const handleNext = () => {
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else if (mode === 'learn' && incorrectCards.length > 0) {
      // Reset to study incorrect cards again
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkCorrect = () => {
    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    handleNext();
  };

  const handleMarkIncorrect = () => {
    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    if (mode === 'learn') {
      setIncorrectCards(prev => {
        if (!prev.find(card => card.id === currentCard.id)) {
          return [...prev, currentCard];
        }
        return prev;
      });
    }
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setIncorrectCards([]);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Study Complete!</h2>
            <p className="text-gray-600 mb-6">
              You've finished studying {set.title}
            </p>
            <div className="space-y-3">
              <Button onClick={handleRestart} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Button variant="outline" onClick={onBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sets
            </Button>
            <div className="text-center">
              <h1 className="font-semibold text-gray-900">{set.title}</h1>
              <p className="text-sm text-gray-600 capitalize">{mode} Mode</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {currentIndex + 1} of {currentCards.length}
              </div>
              <div className="text-xs text-blue-600">
                {Math.round(progress)}% complete
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
      </header>

      {/* Main Study Area */}
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-2xl">
          <Card 
            className="h-80 cursor-pointer transition-transform duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm border border-blue-100"
            onClick={handleFlip}
          >
            <CardContent className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-sm text-blue-600 mb-4 font-medium">
                  {isFlipped ? 'Answer' : 'Question'}
                </div>
                <div className="text-2xl text-gray-900 leading-relaxed">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>
                {!isFlipped && (
                  <div className="text-sm text-gray-500 mt-4">
                    Click to reveal answer
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="mt-6 space-y-4">
            {mode === 'flashcards' && (
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 max-w-32"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleFlip}
                  className="flex-1 max-w-32 bg-blue-600 hover:bg-blue-700"
                >
                  {isFlipped ? 'Show Question' : 'Show Answer'}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex === currentCards.length - 1 && mode === 'flashcards'}
                  className="flex-1 max-w-32"
                >
                  Next
                </Button>
              </div>
            )}

            {mode === 'learn' && isFlipped && (
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleMarkIncorrect}
                  className="flex-1 max-w-40 border-red-200 hover:bg-red-50 text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Study Again
                </Button>
                <Button
                  onClick={handleMarkCorrect}
                  className="flex-1 max-w-40 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Got It!
                </Button>
              </div>
            )}

            {mode === 'learn' && !isFlipped && (
              <div className="flex justify-center">
                <Button
                  onClick={handleFlip}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  Show Answer
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
