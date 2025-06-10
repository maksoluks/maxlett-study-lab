import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Brain } from "lucide-react";
import { FlashcardSet } from "@/components/FlashcardSet";
import { CreateSetModal } from "@/components/CreateSetModal";
import { StudyMode } from "@/components/StudyMode";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  lastStudied?: Date;
}

export interface FlashcardSetData {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
}

const Index = () => {
  const [sets, setSets] = useState<FlashcardSetData[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSet, setActiveSet] = useState<FlashcardSetData | null>(null);
  const [studyMode, setStudyMode] = useState<'flashcards' | 'learn' | 'write' | 'match' | 'test' | null>(null);

  const handleCreateSet = (newSet: FlashcardSetData) => {
    setSets(prev => [...prev, newSet]);
    setIsCreateModalOpen(false);
  };

  const handleStudySet = (set: FlashcardSetData, mode: 'flashcards' | 'learn' | 'write' | 'match' | 'test') => {
    setActiveSet(set);
    setStudyMode(mode);
  };

  const handleBackToSets = () => {
    setActiveSet(null);
    setStudyMode(null);
  };

  if (activeSet && studyMode) {
    return (
      <StudyMode
        set={activeSet}
        mode={studyMode}
        onBack={handleBackToSets}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl">
                <span className="font-bold text-gray-900">Max</span>
                <span className="font-light text-blue-600">Lett</span>
              </h1>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Set
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {sets.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to MaxLett
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Create your first flashcard set and start learning smarter. Import from text, 
              create manually, or build as you go.
            </p>
            <Button
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Set
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set) => (
              <FlashcardSet
                key={set.id}
                set={set}
                onStudy={handleStudySet}
              />
            ))}
          </div>
        )}
      </main>

      <CreateSetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSet={handleCreateSet}
      />
    </div>
  );
};

export default Index;
