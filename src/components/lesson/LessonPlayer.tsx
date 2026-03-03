import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2, RotateCcw, ArrowRight, Loader2 } from 'lucide-react';
import { getLessonById, resolveLessonImages } from '@/services/storageService';
import { speak, stop, preloadVoices } from '@/services/ttsService';
import { Lesson } from '@/types/lesson';
import { toast } from '@/hooks/use-toast';
import mochiCharacter from '@/assets/mochi-avatar.jpeg';

const LessonPlayer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLesson = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const lessonData = await getLessonById(id);
        if (lessonData) {
          const resolved = await resolveLessonImages(lessonData);
          setLesson(resolved);
        } else {
          toast({ title: 'Error', description: 'Lesson not found', variant: 'destructive' });
          navigate('/LessonPlaneHome');
        }
      } catch (error) {
        console.error('Failed to load lesson:', error);
        toast({ title: 'Error', description: 'Failed to load lesson.', variant: 'destructive' });
        navigate('/LessonPlaneHome');
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
    preloadVoices();

    return () => { stop(); };
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || lesson.items.length === 0) {
    return null;
  }

  const currentItem = lesson.items[currentIndex];
  const progress = ((currentIndex + 1) / lesson.items.length) * 100;
  const isLastItem = currentIndex === lesson.items.length - 1;

  const handleSpeak = async () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speak(currentItem.spokenText || currentItem.name);
    } catch (error) {
      console.error('TTS Error:', error);
      toast({ title: 'Audio Error', description: 'Could not play audio. Check browser settings.', variant: 'destructive' });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleRepeat = async () => {
    stop();
    setIsSpeaking(false);
    setTimeout(() => handleSpeak(), 100);
  };

  const handleNext = () => {
    stop();
    setIsSpeaking(false);
    if (!isLastItem) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast({ title: '🎉 Lesson Complete!', description: 'Great job finishing this lesson!' });
      navigate('/LessonPlaneHome');
    }
  };

  const handleExit = () => {
    stop();
    navigate('/LessonPlaneHome');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="w-20" />
        <h1 className="text-xl font-bold text-foreground">
          Learning: {lesson.title}
        </h1>
        <Button variant="secondary" className="rounded-full px-6" onClick={handleExit}>
          End
        </Button>
      </header>

      <main className="flex flex-1 px-6 pb-24">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-8">
          <div className="hidden flex-shrink-0 lg:block">
            <div className="animate-float">
              <img src={mochiCharacter} alt="Mochi Character" className="h-48 w-48 object-contain opacity-90" />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="lesson-content-card flex w-full max-w-lg flex-col items-center rounded-3xl border-4 border-primary/20 bg-card p-8 shadow-xl">
              <div className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-muted/30">
                {currentItem.image ? (
                  <img src={currentItem.image} alt={currentItem.name} className="h-full w-full object-contain p-4" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-8xl">📷</span>
                  </div>
                )}
              </div>

              <h2 className="mt-6 text-4xl font-extrabold uppercase tracking-wide text-foreground">
                {currentItem.name}
              </h2>

              {currentItem.spokenText && currentItem.spokenText !== currentItem.name && (
                <p className="mt-2 text-lg text-muted-foreground">
                  "{currentItem.spokenText}"
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="default"
                  className={`gap-2 rounded-xl px-6 py-3 text-lg ${isSpeaking ? 'animate-pulse' : ''}`}
                  onClick={handleSpeak}
                >
                  <Volume2 className="h-5 w-5" />
                  Listen
                </Button>

                <Button variant="secondary" className="gap-2 rounded-xl px-6 py-3 text-lg" onClick={handleRepeat}>
                  <RotateCcw className="h-5 w-5" />
                  Repeat
                </Button>

                <Button variant="secondary" className="gap-2 rounded-xl px-6 py-3 text-lg" onClick={handleNext}>
                  <ArrowRight className="h-5 w-5" />
                  {isLastItem ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">Lesson Progress</span>
            <span>{currentIndex + 1} of {lesson.items.length}</span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>
      </footer>
    </div>
  );
};

export default LessonPlayer;
