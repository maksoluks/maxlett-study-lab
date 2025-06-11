import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Shuffle, Edit } from "lucide-react";
import { FlashcardSetData, Flashcard } from "@/pages/Index";

interface StudyModeProps {
  set: FlashcardSetData;
  mode: 'flashcards' | 'learn' | 'write' | 'match' | 'test';
  onBack: () => void;
}

interface MatchItem {
  id: string;
  text: string;
  type: 'term' | 'definition';
  cardId: string;
  matched?: boolean;
}

interface TestQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  type: 'multiple-choice' | 'true-false' | 'written';
  userAnswer?: string;
}

export const StudyMode = ({ set, mode, onBack }: StudyModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [incorrectCards, setIncorrectCards] = useState<Flashcard[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  
  // Match game state
  const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  
  // Test mode state
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState<{ correct: number; total: number } | null>(null);

  const currentCards = mode === 'learn' && incorrectCards.length > 0 ? incorrectCards : set.cards;
  const currentCard = currentCards[currentIndex];
  const progress = mode === 'match' ? (matches.size / set.cards.length) * 100 : (studiedCards.size / set.cards.length) * 100;

  // Initialize based on mode
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setIncorrectCards([]);
    setIsComplete(false);
    setUserInput("");
    setShowResult(false);
    setSelectedMatch(null);
    setMatches(new Set());
    setCurrentQuestionIndex(0);
    setTestResults(null);
    setIsEditing(false);

    if (mode === 'match') {
      initializeMatchGame();
    } else if (mode === 'test') {
      initializeTestMode();
    }
  }, [set, mode]);

  const initializeMatchGame = () => {
    const items: MatchItem[] = [];
    set.cards.forEach(card => {
      items.push({
        id: `term-${card.id}`,
        text: card.front,
        type: 'term',
        cardId: card.id
      });
      items.push({
        id: `def-${card.id}`,
        text: card.back,
        type: 'definition',
        cardId: card.id
      });
    });
    // Shuffle the items
    setMatchItems(items.sort(() => Math.random() - 0.5));
  };

  const initializeTestMode = () => {
    const questions: TestQuestion[] = [];
    
    set.cards.forEach((card, index) => {
      // Multiple choice questions
      if (set.cards.length >= 4) {
        const incorrectOptions = set.cards
          .filter(c => c.id !== card.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(c => c.back);
        
        const options = [card.back, ...incorrectOptions].sort(() => Math.random() - 0.5);
        
        questions.push({
          id: `mc-${card.id}`,
          question: card.front,
          options,
          correctAnswer: card.back,
          type: 'multiple-choice'
        });
      }
      
      // True/false questions
      if (index % 2 === 0 && set.cards.length > 1) {
        const randomCard = set.cards[Math.floor(Math.random() * set.cards.length)];
        const isCorrect = Math.random() > 0.5;
        questions.push({
          id: `tf-${card.id}`,
          question: `"${card.front}" means "${isCorrect ? card.back : randomCard.back}"`,
          correctAnswer: isCorrect ? 'true' : 'false',
          type: 'true-false'
        });
      }
      
      // Written questions
      questions.push({
        id: `written-${card.id}`,
        question: `What does "${card.front}" mean?`,
        correctAnswer: card.back,
        type: 'written'
      });
    });
    
    setTestQuestions(questions.sort(() => Math.random() - 0.5));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditFront(currentCard.front);
    setEditBack(currentCard.back);
  };

  const handleSaveEdit = () => {
    // Update the card in the set
    const updatedCards = set.cards.map(card => 
      card.id === currentCard.id 
        ? { ...card, front: editFront.trim(), back: editBack.trim() }
        : card
    );
    
    // Update the set with new cards
    set.cards = updatedCards;
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFront("");
    setEditBack("");
  };

  const handleNext = () => {
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setUserInput("");
      setShowResult(false);
    } else if (mode === 'learn' && incorrectCards.length > 0) {
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
      setUserInput("");
      setShowResult(false);
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

  const handleWriteSubmit = () => {
    const correct = userInput.toLowerCase().trim() === currentCard.back.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    
    if (!correct && mode === 'learn') {
      setIncorrectCards(prev => {
        if (!prev.find(card => card.id === currentCard.id)) {
          return [...prev, currentCard];
        }
        return prev;
      });
    }
  };

  const handleMatchClick = (item: MatchItem) => {
    if (item.matched) return;
    
    if (!selectedMatch) {
      setSelectedMatch(item);
    } else if (selectedMatch.id === item.id) {
      setSelectedMatch(null);
    } else if (selectedMatch.cardId === item.cardId && selectedMatch.type !== item.type) {
      // Correct match
      setMatches(prev => new Set([...prev, item.cardId]));
      setMatchItems(prev => prev.map(i => 
        i.cardId === item.cardId ? { ...i, matched: true } : i
      ));
      setSelectedMatch(null);
      
      if (matches.size + 1 === set.cards.length) {
        setIsComplete(true);
      }
    } else {
      setSelectedMatch(item);
    }
  };

  const handleTestAnswer = (answer: string) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const updatedQuestions = [...testQuestions];
    updatedQuestions[currentQuestionIndex] = { ...currentQuestion, userAnswer: answer };
    setTestQuestions(updatedQuestions);
    
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate results
      const correct = updatedQuestions.filter(q => {
        if (q.type === 'written') {
          return q.userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        }
        return q.userAnswer === q.correctAnswer;
      }).length;
      
      setTestResults({ correct, total: updatedQuestions.length });
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setIncorrectCards([]);
    setIsComplete(false);
    setUserInput("");
    setShowResult(false);
    setSelectedMatch(null);
    setMatches(new Set());
    setCurrentQuestionIndex(0);
    setTestResults(null);
    setIsEditing(false);
    
    if (mode === 'match') {
      initializeMatchGame();
    } else if (mode === 'test') {
      initializeTestMode();
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'test' ? 'Test Complete!' : 'Study Complete!'}
            </h2>
            {testResults && (
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-700">
                  Score: {testResults.correct}/{testResults.total} ({Math.round((testResults.correct / testResults.total) * 100)}%)
                </p>
              </div>
            )}
            <p className="text-gray-600 mb-6">
              You've finished {mode === 'test' ? 'testing on' : 'studying'} {set.title}
            </p>
            <div className="space-y-3">
              <Button onClick={handleRestart} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                {mode === 'test' ? 'Retake Test' : 'Study Again'}
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
              {mode !== 'match' && mode !== 'test' && (
                <>
                  <div className="text-sm text-gray-600">
                    {currentIndex + 1} of {currentCards.length}
                  </div>
                  <div className="text-xs text-blue-600">
                    {Math.round(progress)}% complete
                  </div>
                </>
              )}
              {mode === 'match' && (
                <div className="text-sm text-gray-600">
                  {matches.size} of {set.cards.length} matched
                </div>
              )}
              {mode === 'test' && (
                <div className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {testQuestions.length}
                </div>
              )}
            </div>
          </div>
          {mode !== 'match' && <Progress value={progress} className="mt-2" />}
        </div>
      </header>

      {/* Main Study Area */}
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
        {/* Match Game Mode */}
        {mode === 'match' && (
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {matchItems.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    item.matched 
                      ? 'bg-green-100 border-green-300' 
                      : selectedMatch?.id === item.id
                        ? 'bg-blue-100 border-blue-300 scale-105'
                        : 'bg-white hover:bg-gray-50 hover:scale-105'
                  } ${item.type === 'term' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-purple-500'}`}
                  onClick={() => handleMatchClick(item)}
                >
                  <CardContent className="p-4 h-24 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {item.type === 'term' ? 'Term' : 'Definition'}
                      </div>
                      <div className="text-sm font-medium">{item.text}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Test Mode */}
        {mode === 'test' && testQuestions.length > 0 && (
          <div className="w-full max-w-2xl">
            <Card className="bg-white/90 backdrop-blur-sm border border-blue-100">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-blue-600 mb-2 font-medium">
                    {testQuestions[currentQuestionIndex].type.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="text-xl text-gray-900 mb-6">
                    {testQuestions[currentQuestionIndex].question}
                  </div>
                </div>

                {testQuestions[currentQuestionIndex].type === 'multiple-choice' && (
                  <div className="space-y-3">
                    {testQuestions[currentQuestionIndex].options?.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleTestAnswer(option)}
                        className="w-full text-left justify-start h-auto p-4"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}

                {testQuestions[currentQuestionIndex].type === 'true-false' && (
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleTestAnswer('true')}
                      className="px-8 bg-green-600 hover:bg-green-700"
                    >
                      True
                    </Button>
                    <Button
                      onClick={() => handleTestAnswer('false')}
                      variant="outline"
                      className="px-8 border-red-200 hover:bg-red-50 text-red-700"
                    >
                      False
                    </Button>
                  </div>
                )}

                {testQuestions[currentQuestionIndex].type === 'written' && (
                  <div className="space-y-4">
                    <Input
                      value={testQuestions[currentQuestionIndex].userAnswer || ''}
                      onChange={(e) => {
                        const updatedQuestions = [...testQuestions];
                        updatedQuestions[currentQuestionIndex].userAnswer = e.target.value;
                        setTestQuestions(updatedQuestions);
                      }}
                      placeholder="Type your answer..."
                      className="text-center text-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTestAnswer(testQuestions[currentQuestionIndex].userAnswer || '');
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleTestAnswer(testQuestions[currentQuestionIndex].userAnswer || '')}
                      className="w-full"
                      disabled={!testQuestions[currentQuestionIndex].userAnswer}
                    >
                      Submit Answer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other modes (flashcards, learn, write) */}
        {(mode === 'flashcards' || mode === 'learn' || mode === 'write') && (
          <div className="w-full max-w-2xl">
            <Card 
              className={`h-80 transition-transform duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm border border-blue-100 ${
                mode === 'write' ? '' : 'cursor-pointer'
              }`}
              onClick={mode === 'write' || isEditing ? undefined : handleFlip}
            >
              <CardContent className="h-full flex items-center justify-center p-8">
                <div className="text-center w-full">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="text-sm text-blue-600 mb-4 font-medium">
                        Edit Flashcard
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600">Front:</label>
                          <Input
                            value={editFront}
                            onChange={(e) => setEditFront(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Back:</label>
                          <Input
                            value={editBack}
                            onChange={(e) => setEditBack(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={handleSaveEdit} size="sm">
                          Save
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-blue-600 font-medium">
                          {mode === 'write' ? 'Question' : isFlipped ? 'Answer' : 'Question'}
                        </div>
                        {mode === 'flashcards' && (
                          <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      <div className="text-2xl text-gray-900 leading-relaxed mb-6">
                        {currentCard.front}
                      </div>
                      
                      {mode === 'write' && !showResult && (
                        <div className="space-y-4">
                          <Input
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your answer..."
                            className="text-center text-lg"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && userInput.trim()) {
                                handleWriteSubmit();
                              }
                            }}
                          />
                          <Button
                            onClick={handleWriteSubmit}
                            disabled={!userInput.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Submit Answer
                          </Button>
                        </div>
                      )}
                      
                      {mode === 'write' && showResult && (
                        <div className="space-y-4">
                          <div className={`text-lg font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                          </div>
                          <div className="text-gray-700">
                            <div className="text-sm text-gray-500">Your answer:</div>
                            <div className="mb-2">{userInput}</div>
                            <div className="text-sm text-gray-500">Correct answer:</div>
                            <div>{currentCard.back}</div>
                          </div>
                        </div>
                      )}
                      
                      {(mode === 'flashcards' || mode === 'learn') && isFlipped && (
                        <div className="text-2xl text-gray-900 leading-relaxed">
                          {currentCard.back}
                        </div>
                      )}
                      
                      {(mode === 'flashcards' || mode === 'learn') && !isFlipped && (
                        <div className="text-sm text-gray-500 mt-4">
                          Click to reveal answer
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="mt-6 space-y-4">
              {mode === 'flashcards' && !isEditing && (
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
                    disabled={currentIndex === currentCards.length - 1}
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

              {mode === 'write' && showResult && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleNext}
                    className="px-8 bg-blue-600 hover:bg-blue-700"
                  >
                    {currentIndex === currentCards.length - 1 ? 'Finish' : 'Next Card'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
