import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { StyleProp, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface DialogueChoice {
  id: string;
  text: string;
  effect?: 'positive' | 'negative' | 'neutral';
}

interface DialogueBoxProps {
  speaker?: string;
  text: string;
  choices?: DialogueChoice[];
  onNext?: () => void;
  onChoice?: (choiceId: string) => void;
  isVisible: boolean;
  autoAdvance?: boolean;
  typingSpeed?: number;
  characterImage?: any;
  position?: 'left' | 'right';
  audioUrl?: any;
  style?: StyleProp<ViewStyle>;
}

export default function DialogueBox({
  speaker,
  text,
  choices,
  onNext,
  onChoice,
  isVisible,
  autoAdvance = false,
  typingSpeed = 50,
  characterImage,
  position = 'left',
  audioUrl,
  style,
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);

    let currentIndex = 0;
    const typeText = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, typingSpeed);
      } else {
        setIsTyping(false);
        if (choices && choices.length > 0) {
          setTimeout(() => setShowChoices(true), 500);
        } else if (autoAdvance) {
          setTimeout(() => onNext?.(), 2000);
        }
      }
    };

    typeText();
  }, [text, isVisible, typingSpeed, autoAdvance, choices, onNext]);

  useEffect(() => {
    let sound: Audio.Sound | undefined;
    const playAudio = async () => {
      if (audioUrl) {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(audioUrl);
          sound = newSound;
          await sound.playAsync();
        } catch (error) {
          console.warn('Audio error:', error);
        }
      }
    };
    playAudio();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [audioUrl]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(text);
      setIsTyping(false);
      if (choices && choices.length > 0) {
        setShowChoices(true);
      }
    } else if (!choices || choices.length === 0) {
      onNext?.();
    }
  };

  const handleChoice = (choiceId: string) => {
    onChoice?.(choiceId);
    setShowChoices(false);
  };

  const getChoiceStyle = (choice: DialogueChoice) => {
    switch (choice.effect) {
      case 'positive':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderColor: '#4CAF50',
        };
      case 'negative':
        return {
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          borderColor: '#F44336',
        };
      default:
        return {
          backgroundColor: 'rgba(212, 175, 55, 0.2)',
          borderColor: '#D4AF37',
        };
    }
  };

  if (!isVisible) return null;

  return (
<Animated.View
  entering={SlideInDown.springify()}
  style={[styles.container, style]} // ✅ Terapkan style eksternal
>
      <View style={styles.dialogueWrapper}>
        {characterImage && (
          <Image
            source={characterImage}
            style={[
              styles.characterImage,
              position === 'left' ? styles.leftImage : styles.rightImage,
            ]}
            resizeMode="contain"
          />
        )}

        <LinearGradient
          colors={['#fff8e7', '#f7e6be']}
          style={[
            styles.dialogueBox,
            position === 'left' ? styles.leftBubble : styles.rightBubble,
          ]}
        >
          {speaker && (
            <Text style={styles.speakerName}>{speaker}</Text>
          )}

          <TouchableOpacity
            style={styles.textContainer}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.dialogueText}>{displayedText}</Text>

            {!isTyping && !showChoices && (
              <Animated.View
                entering={FadeIn.delay(300)}
                style={styles.continueIndicator}
              >
                <ChevronDown size={16} color="#D4AF37" />
                <Text style={styles.continueText}>Tap untuk lanjut</Text>
              </Animated.View>
            )}
          </TouchableOpacity>

          {showChoices && choices && choices.length > 0 && (
            <Animated.View
              entering={FadeIn.delay(300)}
              style={styles.choicesContainer}
            >
              <Text style={styles.choicesLabel}>Pilih respons:</Text>
              {choices.map((choice) => (
                <TouchableOpacity
                  key={choice.id}
                  style={[styles.choiceButton, getChoiceStyle(choice)]}
                  onPress={() => handleChoice(choice.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.choiceText}>{choice.text}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  dialogueWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  characterImage: {
    width: 80,
    height: 120,
  },
  leftImage: {
    marginRight: 12,
  },
  rightImage: {
    marginLeft: 12,
  },
  dialogueBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  leftBubble: {
    borderTopLeftRadius: 0,
  },
  rightBubble: {
    borderTopRightRadius: 0,
    alignSelf: 'flex-end',
  },
  speakerName: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  textContainer: {
    minHeight: 60,
  },
  dialogueText: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#2e1a08',
    lineHeight: 24,
  },
  continueIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  continueText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#D4AF37',
    marginLeft: 4,
    opacity: 0.8,
  },
  choicesContainer: {
    marginTop: 16,
  },
  choicesLabel: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  choiceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 15,
    fontFamily: 'CrimsonText-Regular',
    color: '#2e1a08',
    textAlign: 'center',
  },
});
