
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardSetData, Flashcard } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface CreateSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSet: (set: FlashcardSetData) => void;
}

export const CreateSetModal = ({ isOpen, onClose, onCreateSet }: CreateSetModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importText, setImportText] = useState("");
  const [manualCards, setManualCards] = useState<Array<{ front: string; back: string }>>([
    { front: "", back: "" }
  ]);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImportText("");
    setManualCards([{ front: "", back: "" }]);
  };

  const parseImportText = (text: string): Flashcard[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const cards: Flashcard[] = [];

    lines.forEach((line, index) => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        cards.push({
          id: `card-${Date.now()}-${index}`,
          front: parts[0].trim(),
          back: parts[1].trim(),
          difficulty: 0
        });
      }
    });

    return cards;
  };

  const handleCreateFromImport = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your flashcard set.",
        variant: "destructive",
      });
      return;
    }

    const cards = parseImportText(importText);
    if (cards.length === 0) {
      toast({
        title: "Error",
        description: "No valid cards found. Make sure to use the format: front text [TAB] back text",
        variant: "destructive",
      });
      return;
    }

    const newSet: FlashcardSetData = {
      id: `set-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      cards,
      createdAt: new Date()
    };

    onCreateSet(newSet);
    resetForm();
    toast({
      title: "Success",
      description: `Created flashcard set with ${cards.length} cards.`,
    });
  };

  const handleCreateFromManual = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your flashcard set.",
        variant: "destructive",
      });
      return;
    }

    const validCards = manualCards.filter(card => card.front.trim() && card.back.trim());
    if (validCards.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one complete flashcard.",
        variant: "destructive",
      });
      return;
    }

    const cards: Flashcard[] = validCards.map((card, index) => ({
      id: `card-${Date.now()}-${index}`,
      front: card.front.trim(),
      back: card.back.trim(),
      difficulty: 0
    }));

    const newSet: FlashcardSetData = {
      id: `set-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      cards,
      createdAt: new Date()
    };

    onCreateSet(newSet);
    resetForm();
    toast({
      title: "Success",
      description: `Created flashcard set with ${cards.length} cards.`,
    });
  };

  const addManualCard = () => {
    setManualCards(prev => [...prev, { front: "", back: "" }]);
  };

  const updateManualCard = (index: number, field: 'front' | 'back', value: string) => {
    setManualCards(prev => prev.map((card, i) => 
      i === index ? { ...card, [field]: value } : card
    ));
  };

  const removeManualCard = (index: number) => {
    if (manualCards.length > 1) {
      setManualCards(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">Create New Flashcard Set</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Spanish Vocabulary"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>
          </div>

          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import Text</TabsTrigger>
              <TabsTrigger value="manual">Add Manually</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              <div>
                <Label htmlFor="import-text">
                  Paste your flashcards (one per line: front text [TAB] back text)
                </Label>
                <Textarea
                  id="import-text"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`hello\thola\ngoodbye\tadiós\nthank you\tgracias`}
                  className="h-48 font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Format: Use TAB to separate front and back of each card
                </p>
              </div>
              <Button
                onClick={handleCreateFromImport}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!title.trim() || !importText.trim()}
              >
                Create Set from Import
              </Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {manualCards.map((card, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor={`front-${index}`} className="text-xs">Front</Label>
                      <Input
                        id={`front-${index}`}
                        value={card.front}
                        onChange={(e) => updateManualCard(index, 'front', e.target.value)}
                        placeholder="Question or term"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`back-${index}`} className="text-xs">Back</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={`back-${index}`}
                          value={card.back}
                          onChange={(e) => updateManualCard(index, 'back', e.target.value)}
                          placeholder="Answer or definition"
                        />
                        {manualCards.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeManualCard(index)}
                            className="px-2"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={addManualCard}
                  className="flex-1"
                >
                  Add Another Card
                </Button>
                <Button
                  onClick={handleCreateFromManual}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!title.trim() || manualCards.every(card => !card.front.trim() || !card.back.trim())}
                >
                  Create Set
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
