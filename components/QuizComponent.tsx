import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CircleCheck as CheckCircle,
  Circle as XCircle,
  Award,
  Star,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  BounceIn,
} from 'react-native-reanimated';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  isVisible: boolean;
  onComplete: (score: number, answers: number[]) => void;
  onClose: () => void;
  title?: string;
}

export default function QuizComponent({
  questions,
  isVisible,
  onComplete,
  onClose,
  title = 'Kuis Chapter',
}: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isVisible) {
      resetQuiz();
    }
  }, [isVisible]);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowResult(false);
    setShowExplanation(false);
    setIsAnswered(false);
    setScore(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);

    const isCorrect =
      answerIndex === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    if (questions[currentQuestionIndex].explanation) {
      setShowExplanation(true);
    } else {
      setTimeout(() => {
        nextQuestion(newAnswers);
      }, 1500);
    }
  };

  const nextQuestion = (answers: number[]) => {
    setShowExplanation(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      const finalScore = Math.round((score / questions.length) * 100);
      setShowResult(true);
      onComplete(finalScore, answers);
    }
  };

  const handleContinue = () => {
    nextQuestion(userAnswers);
  };

  const handleClose = () => {
    onClose();
    resetQuiz();
  };

  const getScoreColor = (scorePercentage: number) => {
    if (scorePercentage >= 80) return '#4CAF50';
    if (scorePercentage >= 60) return '#FF9800';
    return '#F44336';
  };

  const getScoreMessage = (scorePercentage: number) => {
    if (scorePercentage >= 80)
      return 'Luar biasa! Anda benar-benar memahami cerita ini.';
    if (scorePercentage >= 60)
      return 'Bagus! Anda cukup memperhatikan detail cerita.';
    return 'Jangan menyerah! Coba baca cerita dengan lebih teliti.';
  };

  if (!isVisible) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const finalScore = Math.round((score / questions.length) * 100);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.9)',
            'rgba(26,26,26,0.95)',
            'rgba(75,0,130,0.9)',
          ]}
          style={styles.modalContent}
        >
          {!showResult ? (
            <Animated.View entering={FadeIn} style={styles.quizContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.progress}>
                  {currentQuestionIndex + 1} / {questions.length}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <Animated.View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>

              {/* Question */}
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                  {currentQuestion.question}
                </Text>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                  let optionStyle = [styles.optionButton];

                  if (isAnswered) {
                    if (index === currentQuestion.correctAnswer) {
                      optionStyle.push(styles.correctOption);
                    } else if (
                      index === selectedAnswer &&
                      index !== currentQuestion.correctAnswer
                    ) {
                      optionStyle.push(styles.incorrectOption);
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={optionStyle}
                      onPress={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                      {isAnswered &&
                        index === currentQuestion.correctAnswer && (
                          <CheckCircle size={20} color="#4CAF50" />
                        )}
                      {isAnswered &&
                        index === selectedAnswer &&
                        index !== currentQuestion.correctAnswer && (
                          <XCircle size={20} color="#F44336" />
                        )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Explanation */}
              {showExplanation && currentQuestion.explanation && (
                <Animated.View
                  entering={SlideInDown}
                  style={styles.explanationContainer}
                >
                  <Text style={styles.explanationTitle}>Penjelasan:</Text>
                  <Text style={styles.explanationText}>
                    {currentQuestion.explanation}
                  </Text>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                  >
                    <Text style={styles.continueButtonText}>Lanjutkan</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
          ) : (
            <Animated.View entering={BounceIn} style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Award size={48} color="#D4AF37" />
                <Text style={styles.resultTitle}>Kuis Selesai!</Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text
                  style={[
                    styles.scoreText,
                    { color: getScoreColor(finalScore) },
                  ]}
                >
                  {finalScore}%
                </Text>
                <Text style={styles.scoreLabel}>
                  {score} dari {questions.length} benar
                </Text>
              </View>

              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    color={finalScore >= star * 33 ? '#D4AF37' : '#666'}
                    fill={finalScore >= star * 33 ? '#D4AF37' : 'transparent'}
                  />
                ))}
              </View>

              <Text style={styles.resultMessage}>
                {getScoreMessage(finalScore)}
              </Text>

              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleClose}
              >
                <Text style={styles.finishButtonText}>Selesai</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  quizContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  progress: {
    fontSize: 16,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#FFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    lineHeight: 26,
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incorrectOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    flex: 1,
  },
  explanationContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    lineHeight: 20,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#000',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginTop: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 48,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultMessage: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  finishButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#000',
  },
});
