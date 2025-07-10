import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  FadeIn, 
  SlideInRight, 
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import { Audio } from 'expo-av';

import SceneIllustration from '@/components/SceneIllustration';
import DialogueBox from '@/components/DialogueBox';
import NavigationControls from '@/components/NavigationControls';
import QuizComponent from '@/components/QuizComponent';
import DressUpGame from '@/components/DressUpGame';
import BattleGame from '@/components/BattleGame';
import CandiGame from '@/components/CandiGame';

const { width, height } = Dimensions.get('window');

interface Scene {
  id: string;
  type: 'dialogue' | 'choice' | 'illustration' | 'minigame' | 'quiz';
  speaker?: string;
  text?: string;
  imageUrl?: string;
  choices?: Array<{
    id: string;
    text: string;
    effect?: 'positive' | 'negative' | 'neutral';
    nextScene?: string;
  }>;
  gameType?: 'dressup' | 'battle' | 'candi';
  autoAdvance?: boolean;
  audioUrl?: any;
  characterImage?: any;
}

interface ChapterData {
  id: number;
  title: string;
  scenes: Scene[];
  quiz?: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

const chapterData: Record<number, ChapterData> = {
  1: {
    id: 1,
    title: 'Kerajaan Prambanan',
    scenes: [
      {
        id: 'opening',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/opening.png'),
        text: 'Selamat datang di Kerajaan Prambanan yang megah...',
        speaker: 'Narator',
      },
      {
        id: 'narrator_intro',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Di masa lampau, berdiri megah Kerajaan Prambanan yang dipimpin oleh Raja Baka. Kerajaan ini terkenal dengan kemakmuran dan keindahan arsitekturnya yang menawan.',
        audioUrl: require('../../assets/audio/narac1b1.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/prambanan_palace.png'),
      },
      {
        id: 'roro_intro',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Raja Baka memiliki seorang putri yang cantik jelita bernama Roro Jonggrang. Kecantikannya terkenal hingga ke seluruh nusantara, namun ia juga dikenal memiliki hati yang angkuh.',
        audioUrl: require('../../assets/audio/narac1b2.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/prambanan_palace.png'),
      },
      {
        id: 'palace_scene',
        type: 'illustration',
        text: 'Roro Jonggrang Berbicara dengan Ayahnya',
        imageUrl: require('../../assets/images/story/palace_scene.png'),
      },
      {
        id: 'roro_dialogue',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Ayahanda, mengapa banyak pangeran dari kerajaan lain yang datang melamar? Tidak ada yang setara dengan kemuliaan kerajaan kita.',
        audioUrl: require('../../assets/audio/roroc1b1.mp3'),
        characterImage: require('../../assets/dialog/roro.png'),
        imageUrl: require('../../assets/images/gallery/ruangtahta.png'),
      },
      {
        id: 'king_response',
        type: 'dialogue',
        speaker: 'Raja Baka',
        text: 'Anakku, kecantikanmu memang tiada tara. Namun ingatlah, sombong bukanlah sifat yang baik untuk seorang putri.',
        audioUrl: require('../../assets/audio/bakac1b1.mp3'),
        characterImage: require('../../assets/dialog/baka1.png'),
        imageUrl: require('../../assets/images/gallery/ruangtahta.png'),
      },
      {
        id: 'choice_attitude',
        type: 'choice',
        text: 'Bagaimana sikap Roro Jonggrang terhadap nasihat ayahnya?',
        choices: [
          {
            id: 'humble',
            text: 'Mendengarkan dengan rendah hati',
            effect: 'positive',
            nextScene: 'humble_response',
          },
          {
            id: 'defiant',
            text: 'Tetap mempertahankan pendapatnya',
            effect: 'negative',
            nextScene: 'defiant_response',
          },
          {
            id: 'diplomatic',
            text: 'Menjawab dengan diplomatis',
            effect: 'neutral',
            nextScene: 'diplomatic_response',
          },
        ],
      imageUrl: require('../../assets/images/gallery/pertanyaan.png'),
      audioUrl: require('../../assets/audio/ting.mp3'),
      },
      {
        id: 'humble_response',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Maafkan hamba, Ayahanda. Hamba akan lebih bijaksana dalam bersikap.',
        audioUrl: require('../../assets/audio/roroc1b2.mp3'),
        characterImage: require('../../assets/dialog/roro.png'),
        imageUrl: require('../../assets/images/gallery/ruangtahta.png'),
      },
      {
        id: 'defiant_response',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Namun Ayahanda, bukankah kebanggaan terhadap kerajaan adalah hal yang wajar?',
        audioUrl: require('../../assets/audio/roroc1b3.mp3'),
        characterImage: require('../../assets/dialog/roro.png'),
        imageUrl: require('../../assets/images/gallery/ruangtahta.png'),
      },
      {
        id: 'diplomatic_response',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Hamba mengerti, Ayahanda. Hamba akan mempertimbangkan nasihat Ayahanda dengan baik.',
        audioUrl: require('../../assets/audio/roroc1b4.mp3'),
        characterImage: require('../../assets/dialog/roro.png'),
        imageUrl: require('../../assets/images/gallery/ruangtahta.png'),
      },
      {
        id: 'dressup_game',
        type: 'minigame',
        gameType: 'dressup',
      },
      {
        id: 'chapter_end',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Kehidupan damai di Kerajaan Prambanan akan segera berubah dengan kedatangan seorang pangeran perkasa dari kerajaan tetangga...',
        audioUrl: require('../../assets/audio/narac1b3.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/prambanan_palace.png'),
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Siapa nama raja yang memimpin Kerajaan Prambanan?',
        options: [
          'Raja Baka',
          'Raja Airlangga',
          'Raja Hayam Wuruk',
          'Raja Brawijaya',
        ],
        correctAnswer: 0,
        explanation:
          'Raja Baka adalah pemimpin Kerajaan Prambanan dan ayah dari Roro Jonggrang.',
      },
      {
        id: 'q2',
        question: 'Apa yang membuat Roro Jonggrang terkenal?',
        options: [
          'Kepandaiannya',
          'Kecantikannya',
          'Kekayaannya',
          'Kesaktiannya',
        ],
        correctAnswer: 1,
        explanation:
          'Roro Jonggrang terkenal karena kecantikannya yang tiada tara hingga ke seluruh nusantara.',
      },
      {
        id: 'q3',
        question:
          'Bagaimana sifat Roro Jonggrang yang disebutkan dalam cerita?',
        options: ['Rendah hati', 'Angkuh', 'Pemalu', 'Penyayang'],
        correctAnswer: 1,
        explanation:
          'Meskipun cantik, Roro Jonggrang dikenal memiliki sifat yang angkuh.',
      },
    ],
  },

  2: {
    id: 2,
    title: 'Bandung Bondowoso',
    scenes: [
      {
        id: 'war_scene',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/war_scene.png'),
      },
      {
        id: 'war_intro',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Suatu hari, pasukan besar dari Kerajaan Pengging menyerang Prambanan. Dipimpin oleh pangeran muda yang sakti mandraguna bernama Bandung Bondowoso.',
        audioUrl: require('../../assets/audio/narac2b1.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/kerajaanpenging.png'),
      },
      {
        id: 'bandung_intro',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Aku datang bukan untuk menghancurkan, melainkan untuk menyatukan kerajaan ini di bawah kekuasaanku!',
        audioUrl: require('../../assets/audio/bandc2b1.mp3'),
        characterImage: require('../../assets/dialog/bandung1.png'),
        imageUrl: require('../../assets/images/gallery/kerajaanpenging.png'),
      },
      {
        id: 'battle_game',
        type: 'minigame',
        gameType: 'battle',
        imageUrl: require('../../assets/images/gallery/battle_scene.png'),
      },
      {
        id: 'victory_scene',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/victory_scene.png'),
      },
      {
        id: 'defeat_dialogue',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Dengan kekuatan magisnya, Bandung Bondowoso berhasil mengalahkan pasukan Prambanan. Raja Baka tewas dalam pertempuran.',
        audioUrl: require('../../assets/audio/narac2b2.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/kerajaanpenging.png'),
      },
      {
        id: 'roro_grief',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Ayahanda... Engkau telah membunuh ayahku! Aku tidak akan pernah memaafkanmu!',
        audioUrl: require('../../assets/audio/roroc2b1.mp3'),
        characterImage: require('../../assets/dialog/roro2.png'),
        imageUrl: require('../../assets/images/gallery/battle_scene.png'),
      },
      {
        id: 'bandung_response',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Putri, aku menyesal atas kematian ayahmu. Namun dalam perang, hal ini tidak dapat dihindari.',
        audioUrl: require('../../assets/audio/bandc2b2.mp3'),
        characterImage: require('../../assets/dialog/bandung2.png'),
        imageUrl: require('../../assets/images/gallery/battle_scene.png'),
      },
      {
        id: 'choice_reaction',
        type: 'choice',
        text: 'Bagaimana reaksi Roro Jonggrang terhadap pernyataan Bandung Bondowoso?',
        choices: [
          {
            id: 'angry',
            text: 'Menunjukkan kemarahan yang besar',
            effect: 'negative',
            nextScene: 'angry_response',
          },
          {
            id: 'cold',
            text: 'Bersikap dingin dan diam',
            effect: 'neutral',
            nextScene: 'cold_response',
          },
          {
            id: 'diplomatic',
            text: 'Mencoba memahami situasi',
            effect: 'positive',
            nextScene: 'understanding_response',
          },
        ],
        imageUrl: require('../../assets/images/gallery/pertanyaan.png'),
        audioUrl: require('../../assets/audio/ting.mp3'),
      },
      {
        id: 'angry_response',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Penyesalanmu tidak akan menghidupkan ayahku kembali! Aku benci padamu!',
        audioUrl: require('../../assets/audio/roroc2b2.mp3'),
        characterImage: require('../../assets/dialog/roro2.png'),
        imageUrl: require('../../assets/images/gallery/battle_scene.png'),
      },
      {
        id: 'cold_response',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: '...',
        characterImage: require('../../assets/dialog/roro2.png'),
        imageUrl: require('../../assets/images/gallery/battle_scene.png'),
      },
      {
        id: 'understanding_response',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Meskipun hatiku hancur, aku mengerti bahwa ini adalah konsekuensi dari perang.',
        audioUrl: require('../../assets/audio/roroc2b3.mp3'),
        characterImage: require('../../assets/dialog/roro.png'),
        imageUrl: require('../../assets/images/gallery/battle_scene.png'),
      },
      {
        id: 'chapter_end',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Bandung Bondowoso kini menguasai Prambanan. Namun hatinya mulai tertarik pada kecantikan Roro Jonggrang...',
        audioUrl: require('../../assets/audio/narac2b3.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/kerajaanpenging.png'),
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Dari kerajaan mana Bandung Bondowoso berasal?',
        options: ['Majapahit', 'Pengging', 'Mataram', 'Singhasari'],
        correctAnswer: 1,
        explanation:
          'Bandung Bondowoso adalah pangeran dari Kerajaan Pengging.',
      },
      {
        id: 'q2',
        question: 'Apa yang membuat Bandung Bondowoso kuat dalam pertempuran?',
        options: [
          'Pasukan yang banyak',
          'Kekuatan magis',
          'Senjata canggih',
          'Strategi perang',
        ],
        correctAnswer: 1,
        explanation:
          'Bandung Bondowoso memiliki kekuatan magis yang membuatnya sakti mandraguna.',
      },
      {
        id: 'q3',
        question: 'Apa yang terjadi pada Raja Baka dalam pertempuran?',
        options: ['Melarikan diri', 'Menyerah', 'Tewas', 'Terluka parah'],
        correctAnswer: 2,
        explanation:
          'Raja Baka tewas dalam pertempuran melawan Bandung Bondowoso.',
      },
    ],
  },
  3: {
    id: 3,
    title: 'Lamaran & Tantangan',
    scenes: [
      {
        id: 'throne_room',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/throne_room.png'),
      },
      {
        id: 'proposal_intro',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Beberapa bulan setelah kemenangan, Bandung Bondowoso memanggil Roro Jonggrang ke ruang singgasana.',
        audioUrl: require('../../assets/audio/narac3b1.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/story/throne_room.png'),
      },
      {
        id: 'bandung_proposal',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Roro Jonggrang, kecantikanmu telah memikat hatiku. Aku ingin menjadikanmu permaisuriku.',
        audioUrl: require('../../assets/audio/bandc3b1.mp3'),
        characterImage: require('../../assets/dialog/bandung3.png'),
        imageUrl: require('../../assets/images/gallery/tahta.png'),
      },
      {
        id: 'roro_shock',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Apa?! Engkau ingin menikahiku setelah membunuh ayahku?',
        audioUrl: require('../../assets/audio/roroc3b1.mp3'),
        characterImage: require('../../assets/dialog/roro3.png'),
        imageUrl: require('../../assets/images/gallery/tahta.png'),
      },
      {
        id: 'choice_response',
        type: 'choice',
        text: 'Bagaimana Roro Jonggrang merespons lamaran Bandung Bondowoso?',
        choices: [
          {
            id: 'direct_reject',
            text: 'Menolak secara langsung',
            effect: 'negative',
            nextScene: 'direct_rejection',
          },
          {
            id: 'challenge',
            text: 'Memberikan tantangan mustahil',
            effect: 'neutral',
            nextScene: 'impossible_challenge',
          },
          {
            id: 'consider',
            text: 'Meminta waktu untuk berpikir',
            effect: 'positive',
            nextScene: 'time_request',
          },
        ],
        imageUrl: require('../../assets/images/gallery/pertanyaan.png'),
        audioUrl: require('../../assets/audio/ting.mp3'),
      },
            {
        id: 'direct_rejection',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Tidak! Aku tidak akan pernah menikah dengan pembunuh ayahku!',
        audioUrl: require('../../assets/audio/roroc3b2.mp3'),
        characterImage: require('../../assets/dialog/roro3.png'),
        imageUrl: require('../../assets/images/gallery/tahta.png'),
      },

      {
        id: 'impossible_challenge',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Baiklah, tapi aku punya syarat. Jika engkau bisa memenuhinya, aku akan menjadi istrimu.',
        audioUrl: require('../../assets/audio/roroc3b3.mp3'),
        characterImage: require('../../assets/dialog/roro3.png'),
        imageUrl: require('../../assets/images/gallery/tahta.png'),
      },
            {
        id: 'time_request',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Ini terlalu mendadak. Berikanlah aku waktu untuk memikirkannya.',
        audioUrl: require('../../assets/audio/roroc3b4.mp3'),
        characterImage: require('../../assets/dialog/roro3.png'),
        imageUrl: require('../../assets/images/gallery/tahta.png'),
      },
      {
        id: 'challenge_explanation',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Bangunkan seribu candi dalam satu malam. Jika engkau berhasil, aku akan menjadi istrimu.',
        audioUrl: require('../../assets/audio/roroc3b5.mp3'),
        characterImage: require('../../assets/dialog/roro3.png'),
        imageUrl: require('../../assets/images/gallery/tahta.png'),
      },
      {
        id: 'bandung_confident',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Seribu candi dalam satu malam? Baiklah, aku menerima tantanganmu!',
        audioUrl: require('../../assets/audio/bandc3b2.mp3'),
        characterImage: require('../../assets/dialog/bandung3.png'),
        imageUrl: require('../../assets/images/gallery/tahta.png'),
      },
      {
        id: 'challenge_scene',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/challenge_scene.png'),
      },
      {
        id: 'roro_thought',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: '(Dalam hati) Tidak mungkin dia bisa membangun seribu candi dalam satu malam. Ini adalah cara untuk menolaknya tanpa konfrontasi langsung.',
        audioUrl: require('../../assets/audio/roroc3b6.mp3'),
        characterImage: require('../../assets/dialog/roro3.png'),
        imageUrl: require('../../assets/images/gallery/tahta.png'),
      },
      {
        id: 'chapter_end',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Tantangan telah diberikan. Akankah Bandung Bondowoso mampu memenuhi permintaan yang tampak mustahil ini?',
        audioUrl: require('../../assets/audio/narac3b2.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/story/throne_room.png'),
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Apa yang diinginkan Bandung Bondowoso dari Roro Jonggrang?',
        options: ['Persahabatan', 'Pernikahan', 'Kesetiaan', 'Pengampunan'],
        correctAnswer: 1,
        explanation:
          'Bandung Bondowoso ingin menjadikan Roro Jonggrang sebagai permaisuri.',
      },
      {
        id: 'q2',
        question:
          'Berapa jumlah candi yang harus dibangun menurut tantangan Roro Jonggrang?',
        options: ['500 candi', '750 candi', '1000 candi', '1500 candi'],
        correctAnswer: 2,
        explanation:
          'Roro Jonggrang menantang Bandung Bondowoso untuk membangun seribu candi.',
      },
      {
        id: 'q3',
        question: 'Dalam waktu berapa lama candi harus selesai dibangun?',
        options: ['Satu hari', 'Satu malam', 'Satu minggu', 'Satu bulan'],
        correctAnswer: 1,
        explanation:
          'Tantangannya adalah membangun seribu candi dalam satu malam.',
      },
    ],
  },
  4: {
    id: 4,
    title: 'Pembangunan Candi',
    scenes: [
      {
        id: 'night_scene',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/night_scene.png'),
      },
      {
        id: 'construction_start',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Malam tiba. Bandung Bondowoso mulai menggunakan kekuatan magisnya untuk memanggil para jin dan roh halus membantu pembangunan.',
        audioUrl: require('../../assets/audio/narac4b1.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/story/night_scene.png'),
      },
      {
        id: 'magic_summon',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Wahai para jin dan makhluk halus! Bantulah aku membangun seribu candi sebelum fajar menyingsing!',
        audioUrl: require('../../assets/audio/bandc4b1.mp3'),
        characterImage: require('../../assets/dialog/bandung4.png'),
        imageUrl: require('../../assets/images/story/night_scene.png'),
      },
      {
        id: 'candi_game',
        type: 'minigame',
        gameType: 'candi',
      },
      {
        id: 'progress_scene',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
      {
        id: 'roro_worry',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Tidak mungkin! Dia benar-benar bisa membangun candi dengan cepat. Aku harus melakukan sesuatu!',
        audioUrl: require('../../assets/audio/roroc4b1.mp3'),
        characterImage: require('../../assets/dialog/roro4.png'),
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
      {
        id: 'choice_sabotage',
        type: 'choice',
        text: 'Apa yang akan dilakukan Roro Jonggrang?',
        choices: [
          {
            id: 'accept_fate',
            text: 'Menerima kenyataan dan menunggu',
            effect: 'positive',
            nextScene: 'accept_ending',
          },
          {
            id: 'sabotage',
            text: 'Menyabotase pembangunan',
            effect: 'negative',
            nextScene: 'sabotage_plan',
          },
          {
            id: 'negotiate',
            text: 'Mencoba bernegosiasi',
            effect: 'neutral',
            nextScene: 'negotiation_attempt',
          },
        ],
        imageUrl: require('../../assets/images/gallery/pertanyaan.png'),
        audioUrl: require('../../assets/audio/ting.mp3'),
      },
      {
        id: 'accept_ending',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Mungkin ini memang takdir. Jika dia berhasil, aku akan menepati janjiku.',
        audioUrl: require('../../assets/audio/roroc4b2.mp3'),
        characterImage: require('../../assets/dialog/roro6.png'),
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
      {
        id: 'sabotage_plan',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Aku harus membuat ayam berkokok sebelum waktunya agar para jin mengira fajar telah tiba!',
        audioUrl: require('../../assets/audio/roroc4b3.mp3'),
        characterImage: require('../../assets/dialog/roro5.png'),
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
      {
        id: 'negotiation_attempt',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Bandung Bondowoso! Bisakah kita bicara sejenak?',
        audioUrl: require('../../assets/audio/roroc4b4.mp3'),
        characterImage: require('../../assets/dialog/roro6.png'),
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
      {
        id: 'sabotage_action',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Roro Jonggrang menyuruh dayang-dayangnya membakar jerami dan menumbuk lesung untuk meniru suara fajar.',
        audioUrl: require('../../assets/audio/narac4b2.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
      {
        id: 'jin_confused',
        type: 'dialogue',
        speaker: 'Jin',
        text: 'Fajar sudah tiba! Kita harus pergi sebelum matahari terbit!',
        audioUrl: require('../../assets/audio/jinc4b1.mp3'),
        characterImage: require('../../assets/dialog/jin.png'),
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
      {
        id: 'bandung_angry',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Tunggu! Ini belum fajar! Roro Jonggrang, engkau telah menipuku!',
        audioUrl: require('../../assets/audio/bandc4b2.mp3'),
        characterImage: require('../../assets/dialog/bandung5.png'),
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
      {
        id: 'chapter_end',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Pembangunan terhenti saat candi ke-999. Kemarahan Bandung Bondowoso akan membawa konsekuensi yang tak terduga...',
        audioUrl: require('../../assets/audio/narac4b3.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/story/progress_scene.png'),
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Siapa yang membantu Bandung Bondowoso membangun candi?',
        options: [
          'Rakyat Prambanan',
          'Tentara Pengging',
          'Jin dan roh halus',
          'Tukang bangunan',
        ],
        correctAnswer: 2,
        explanation:
          'Bandung Bondowoso menggunakan kekuatan magis untuk memanggil jin dan roh halus.',
      },
      {
        id: 'q2',
        question: 'Bagaimana cara Roro Jonggrang menyabotase pembangunan?',
        options: [
          'Merusak candi',
          'Meniru suara fajar',
          'Mengusir jin',
          'Menyembunyikan bahan',
        ],
        correctAnswer: 1,
        explanation:
          'Roro Jonggrang menyuruh dayang-dayangnya meniru suara fajar agar jin pergi.',
      },
      {
        id: 'q3',
        question: 'Berapa jumlah candi yang berhasil dibangun?',
        options: ['998 candi', '999 candi', '1000 candi', '1001 candi'],
        correctAnswer: 1,
        explanation:
          'Pembangunan terhenti saat candi ke-999, kurang satu dari target.',
      },
    ],
  },
  5: {
    id: 5,
    title: 'Akhir Cerita',
    scenes: [
      {
        id: 'dawn_scene',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/dawn_scene.png'),
      },
      {
        id: 'confrontation',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Roro Jonggrang! Engkau telah menipuku! Aku hampir berhasil menyelesaikan tantanganmu!',
        audioUrl: require('../../assets/audio/bandc5b1.mp3'),
        characterImage: require('../../assets/dialog/bandung8.png'),
        imageUrl: require('../../assets/images/story/opening.png'),
      },
      {
        id: 'roro_defiant',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Aku tidak menipu! Fajar memang sudah tiba, dan engkau gagal menyelesaikan tantangan!',
        audioUrl: require('../../assets/audio/roroc5b1.mp3'),
        characterImage: require('../../assets/dialog/roro4.png'),
        imageUrl: require('../../assets/images/story/opening.png'),
      },
      {
        id: 'choice_ending',
        type: 'choice',
        text: 'Bagaimana akhir dari konflik ini?',
        choices: [
          {
            id: 'classic_ending',
            text: 'Mengikuti legenda klasik',
            effect: 'neutral',
            nextScene: 'classic_curse',
          },
          {
            id: 'romantic_ending',
            text: 'Akhir yang romantis',
            effect: 'positive',
            nextScene: 'romantic_resolution',
          },
          {
            id: 'peaceful_ending',
            text: 'Resolusi damai',
            effect: 'positive',
            nextScene: 'peaceful_resolution',
          },
        ],
        imageUrl: require('../../assets/images/gallery/pertanyaan.png'),
        audioUrl: require('../../assets/audio/ting.mp3'),
      },
      {
        id: 'classic_curse',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Jika engkau tidak mau menjadi istriku dengan baik, jadilah arca untuk melengkapi candi ke-1000!',
        audioUrl: require('../../assets/audio/bandc5b3.mp3'),
        characterImage: require('../../assets/dialog/bandung8.png'),
        imageUrl: require('../../assets/images/story/classic_transformation.png'),
      },
      {
        id: 'classic_transformation',
        type: 'illustration',
        imageUrl: require('../../assets/images/story/classic_transformation.png'),
      },
      {
        id: 'classic_end',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Roro Jonggrang berubah menjadi arca batu yang indah, melengkapi candi Prambanan. Hingga kini, arca tersebut masih berdiri megah sebagai saksi bisu legenda cinta yang tragis.',
        audioUrl: require('../../assets/audio/narac5b1.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/prambanan_palace.png'),
      },
      {
        id: 'romantic_resolution',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Roro Jonggrang, aku mengerti kemarahanmu. Maafkan aku atas kematian ayahmu. Aku tidak akan memaksamu.',
        audioUrl: require('../../assets/audio/bandc5b4.mp3'),
        characterImage: require('../../assets/dialog/bandung4.png'),
        imageUrl: require('../../assets/images/gallery/peaceful_ending.png'),
      },
      {
        id: 'romantic_response',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Bandung Bondowoso... melihat usahamu yang sungguh-sungguh, hatiku mulai terbuka. Mungkin kita bisa memulai dari awal.',
        audioUrl: require('../../assets/audio/roroc5b2.mp3'),
        characterImage: require('../../assets/dialog/roro6.png'),
        imageUrl: require('../../assets/images/gallery/peaceful_ending.png'),
      },
      {
        id: 'romantic_end',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Cinta sejati mengalahkan dendam. Roro Jonggrang dan Bandung Bondowoso menikah dan memerintah dengan bijaksana, menjadikan Prambanan kerajaan yang damai dan makmur.',
        audioUrl: require('../../assets/audio/narac5b2.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/prambanan_palace.png'),
      },
      {
        id: 'peaceful_resolution',
        type: 'dialogue',
        speaker: 'Roro Jonggrang',
        text: 'Bandung Bondowoso, mari kita akhiri permusuhan ini. Aku akan menjadi ratu, tapi sebagai partner, bukan sebagai hadiah.',
        audioUrl: require('../../assets/audio/roroc5b3.mp3'),
        characterImage: require('../../assets/dialog/roro6.png'),
        imageUrl: require('../../assets/images/gallery/peaceful_ending.png'),
      },
      {
        id: 'peaceful_agreement',
        type: 'dialogue',
        speaker: 'Bandung Bondowoso',
        text: 'Aku setuju. Mari kita membangun kerajaan ini bersama-sama, dengan saling menghormati.',
        audioUrl: require('../../assets/audio/bandc5b4.mp3'),
        characterImage: require('../../assets/dialog/bandung2.png'),
        imageUrl: require('../../assets/images/gallery/peaceful_ending.png'),
      },
      {
        id: 'peaceful_end',
        type: 'dialogue',
        speaker: 'Narator',
        text: 'Kebijaksanaan mengalahkan ego. Kerajaan Prambanan berkembang menjadi simbol persatuan dan toleransi, dengan 999 candi sebagai monumen perdamaian.',
        audioUrl: require('../../assets/audio/narac5b3.mp3'),
        characterImage: require('../../assets/dialog/narator.png'),
        imageUrl: require('../../assets/images/gallery/prambanan_palace.png'),
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Mengapa Bandung Bondowoso marah kepada Roro Jonggrang?',
        options: [
          'Karena ditolak',
          'Karena ditipu',
          'Karena dihina',
          'Karena diabaikan',
        ],
        correctAnswer: 1,
        explanation:
          'Bandung Bondowoso marah karena merasa ditipu oleh sabotase Roro Jonggrang.',
      },
      {
        id: 'q2',
        question: 'Dalam legenda klasik, apa yang terjadi pada Roro Jonggrang?',
        options: [
          'Melarikan diri',
          'Berubah menjadi arca',
          'Menikah paksa',
          'Diasingkan',
        ],
        correctAnswer: 1,
        explanation:
          'Dalam legenda klasik, Roro Jonggrang dikutuk menjadi arca batu.',
      },
      {
        id: 'q3',
        question: 'Apa pesan moral utama dari legenda Roro Jonggrang?',
        options: [
          'Cinta sejati',
          'Konsekuensi kesombongan',
          'Kekuatan magic',
          'Kesetiaan kerajaan',
        ],
        correctAnswer: 1,
        explanation:
          'Legenda ini mengajarkan tentang konsekuensi dari kesombongan dan pentingnya kebijaksanaan.',
      },
    ],
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  sceneContainer: {
    flex: 1,
    position: 'relative',
  },
  characterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    height: height * 0.85, // 85% of screen height
    width: width,
    resizeMode: 'contain',
  },
  characterImageLeft: {
    alignSelf: 'flex-start',
    marginLeft: -width * 0.1,
  },
  characterImageRight: {
    alignSelf: 'flex-end',
    marginRight: -width * 0.1,
  },
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    pointerEvents: 'box-none',
  },
  headerContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 3,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  chapterHeader: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    backdropFilter: 'blur(10px)',
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  sceneProgress: {
    fontSize: 14,
    color: '#ccc',
    opacity: 0.8,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  minigameContainer: {
    backgroundColor: 'rgba(45, 27, 78, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#6c47ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  minigameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  minigameDescription: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  startGameButton: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 8,
    shadowColor: '#6c47ff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  startGameText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scoreContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(45, 27, 78, 0.9)',
    borderRadius: 16,
    padding: 12,
    zIndex: 10,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  scoreBar: {
    width: 80,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  scoreFill: {
    height: 8,
    backgroundColor: '#6c47ff',
    borderRadius: 4,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dialogueContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  navigationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
});

export default function ChapterScreen() {
  const { id } = useLocalSearchParams();
  const chapterId = parseInt(id as string);
  
  // State management
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [gameChoices, setGameChoices] = useState<Record<string, string>>({});
  const [relationshipScore, setRelationshipScore] = useState(50);
  const [showMinigame, setShowMinigame] = useState(false);
  const [currentGameType, setCurrentGameType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const soundRef = useRef<Audio.Sound | null>(null);

  // Animated values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const characterFadeAnim = useSharedValue(0);

  // Memoized values
  const chapter = useMemo(() => chapterData[chapterId], [chapterId]);
  const currentScene = useMemo(() => chapter?.scenes[currentSceneIndex], [chapter, currentSceneIndex]);
  
  const isDialogueScene = useMemo(() => {
    if (!currentScene) return false;
    return currentScene.type === 'dialogue' || 
           currentScene.type === 'choice' ||
           (currentScene.type === 'illustration' && currentScene.text);
  }, [currentScene]);

  const canGoNext = useMemo(() => {
    return currentScene?.type !== 'choice' && currentScene?.type !== 'minigame';
  }, [currentScene]);

  const canGoBack = useMemo(() => {
    return currentSceneIndex > 0;
  }, [currentSceneIndex]);

  const characterPosition = useMemo<"left" | "right" | undefined>(() => {
    if (!currentScene?.speaker) return undefined;
    return currentScene.speaker === 'Roro Jonggrang' ? 'left' : 'right';
  }, [currentScene?.speaker]);

  // Audio functions
  const playAudio = useCallback(async (audioUrl: any) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(audioUrl);
      soundRef.current = sound;
      setSound(sound);
      setIsPlaying(true);

      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.log('Error playing audio:', error);
      setIsPlaying(false);
    }
  }, []);

  const stopAudio = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setSound(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.log('Error stopping audio:', error);
    }
  }, []);

  const skipScene = useCallback(async () => {
    await stopAudio();
    handleNext();
  }, [stopAudio]);

  // Effects
  useEffect(() => {
    if (!chapter) {
      Alert.alert('Error', 'Chapter tidak ditemukan', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }
    
    // Initialize animations
    fadeAnim.value = withTiming(1, { duration: 500 });
    slideAnim.value = withTiming(0, { duration: 500 });
    setIsLoading(false);
  }, [chapter]);

  useEffect(() => {
    // Animate scene transitions
    fadeAnim.value = withTiming(0, { duration: 200 });
    characterFadeAnim.value = withTiming(0, { duration: 200 });
    
    setTimeout(() => {
      fadeAnim.value = withTiming(1, { duration: 300 });
      characterFadeAnim.value = withTiming(1, { duration: 400 });
    }, 200);

    // Play audio if available
    if (currentScene?.audioUrl) {
      playAudio(currentScene.audioUrl);
    } else {
      stopAudio();
    }
  }, [currentSceneIndex, currentScene, playAudio, stopAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const characterAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: characterFadeAnim.value,
    };
  });

  // Handlers
  const handleNext = useCallback(async () => {
    await stopAudio();
    
    if (currentSceneIndex < chapter.scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    } else {
      setShowQuiz(true);
    }
  }, [currentSceneIndex, chapter?.scenes.length, stopAudio]);

  const handleBack = useCallback(async () => {
    await stopAudio();
    
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  }, [currentSceneIndex, stopAudio]);

  const handleChoice = useCallback(async (choiceId: string) => {
    const choice = currentScene?.choices?.find((c) => c.id === choiceId);
    if (!choice) return;

    await stopAudio();

    // Update game choices
    setGameChoices(prev => ({ ...prev, [currentScene.id]: choiceId }));

    // Update relationship score
    if (choice.effect === 'positive') {
      setRelationshipScore(prev => Math.min(100, prev + 10));
    } else if (choice.effect === 'negative') {
      setRelationshipScore(prev => Math.max(0, prev - 10));
    }

    // Navigate to next scene
    if (choice.nextScene) {
      const nextSceneIndex = chapter.scenes.findIndex(s => s.id === choice.nextScene);
      if (nextSceneIndex !== -1) {
        setCurrentSceneIndex(nextSceneIndex);
        return;
      }
    }
    
    if (currentSceneIndex < chapter.scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    } else {
      setShowQuiz(true);
    }
  }, [currentScene, chapter?.scenes, currentSceneIndex, stopAudio]);

  const handleMinigameStart = useCallback((gameType: string) => {
    setCurrentGameType(gameType);
    setShowMinigame(true);
  }, []);

  const handleMinigameComplete = useCallback((score: number) => {
    setShowMinigame(false);
    setRelationshipScore(prev => Math.min(100, prev + score));
    handleNext();
  }, [handleNext]);

  const handleQuizComplete = useCallback(async (score: number, answers: number[]) => {
    try {
      const progress = (await AsyncStorage.getItem('chapterProgress')) || '{}';
      const chapterProgress = JSON.parse(progress);

      chapterProgress[chapterId] = {
        ...(chapterProgress[chapterId] || {}),
        isCompleted: true,
        score,
        relationshipScore,
        choices: gameChoices,
        completedAt: new Date().toISOString(),
      };

      // Unlock next chapter
      if (chapterId < 5) {
        chapterProgress[chapterId + 1] = {
          ...(chapterProgress[chapterId + 1] || {}),
          isUnlocked: true,
        };
      }

      await AsyncStorage.setItem('chapterProgress', JSON.stringify(chapterProgress));

      // Handle achievements
      const achievements = (await AsyncStorage.getItem('achievements')) || '[]';
      const unlockedAchievements: string[] = JSON.parse(achievements);

      if (score >= 80 && !unlockedAchievements.includes('perfect_quiz')) {
        unlockedAchievements.push('perfect_quiz');
      }
      if (chapterId === 1 && !unlockedAchievements.includes('first_chapter')) {
        unlockedAchievements.push('first_chapter');
      }

      await AsyncStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
      
      setShowQuiz(false);
      router.back();
    } catch (error) {
      console.log('Error saving progress:', error);
      Alert.alert('Error', 'Failed to save progress');
    }
  }, [chapterId, relationshipScore, gameChoices]);

  // Loading state
  if (isLoading || !chapter || !currentScene) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.container}>
        {/* Background Scene */}
        <View style={styles.sceneContainer}>
          <SceneIllustration
            imageUrl={currentScene.imageUrl}
            allowZoom={false}
            overlay={true}
          />
          
          {/* Full-Height Character Display */}
          {currentScene.characterImage && (
            <Animated.View 
              style={[styles.characterContainer, characterAnimatedStyle]}
            >
              <Animated.Image
                source={currentScene.characterImage}
                style={[
                  styles.characterImage,
                  characterPosition === 'left' && styles.characterImageLeft,
                  characterPosition === 'right' && styles.characterImageRight,
                ]}
                entering={FadeIn.duration(600)}
                exiting={FadeOut.duration(300)}
              />
            </Animated.View>
          )}
        </View>

        {/* UI Overlay */}
        <View style={styles.uiOverlay}>
          {/* Navigation Controls */}
          <View style={styles.navigationContainer}>
            <NavigationControls
              onBack={canGoBack ? handleBack : undefined}
              onNext={canGoNext ? handleNext : undefined}
              showBack={canGoBack}
              showNext={canGoNext}
            />
          </View>

          {/* Chapter Header */}
          <View style={styles.headerContainer}>
            <Animated.View entering={FadeIn.delay(300)} style={styles.chapterHeader}>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              <Text style={styles.sceneProgress}>
                {currentSceneIndex + 1} / {chapter.scenes.length}
              </Text>
            </Animated.View>
          </View>



          {/* Content Area */}
          <View style={styles.contentContainer}>
            {/* Minigame Component */}
            {currentScene.type === 'minigame' && (
              <Animated.View 
                entering={SlideInRight.delay(400)} 
                exiting={FadeOut}
                style={styles.minigameContainer}
              >
                <Text style={styles.minigameTitle}>🎮 Mini Game</Text>
                <Text style={styles.minigameDescription}>
                  {currentScene.gameType === 'dressup' && 'Bantu Roro Jonggrang memilih pakaian yang tepat untuk acara kerajaan'}
                  {currentScene.gameType === 'battle' && 'Pimpin pasukan dalam pertempuran strategis melawan musuh'}
                  {currentScene.gameType === 'candi' && 'Bantu membangun candi dengan cepat sebelum fajar menyingsing'}
                </Text>
                <TouchableOpacity
                  style={styles.startGameButton}
                  onPress={() => handleMinigameStart(currentScene.gameType!)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startGameText}>🚀 Mulai Permainan</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          {/* Dialogue Box */}
          {isDialogueScene && (
            <View style={styles.dialogueContainer}>
              <DialogueBox
                speaker={currentScene.speaker}
                text={currentScene.text || ''}
                choices={currentScene.choices}
                onNext={handleNext}
                onChoice={handleChoice}
                isVisible={true}
                autoAdvance={currentScene.autoAdvance}
                characterImage={currentScene.characterImage}
                audioUrl={currentScene.audioUrl}
                position={characterPosition}
              />
            </View>
          )}
        </View>

        {/* Relationship Score */}
        <Animated.View style={[styles.scoreContainer, animatedStyle]}>
          <Text style={styles.scoreLabel}>💝 Hubungan</Text>
          <View style={styles.scoreBar}>
            <Animated.View 
              style={[
                styles.scoreFill, 
                { width: `${relationshipScore}%` }
              ]} 
            />
          </View>
          <Text style={styles.scoreValue}>{relationshipScore}%</Text>
        </Animated.View>

        {/* Quiz Component */}
        <QuizComponent
          questions={chapter.quiz ?? []}
          isVisible={showQuiz}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
          title={`📚 Kuis ${chapter.title}`}
        />

        {/* Minigame Components */}
        {showMinigame && currentGameType === 'dressup' && (
          <DressUpGame
            isVisible={showMinigame}
            onComplete={handleMinigameComplete}
            onClose={() => setShowMinigame(false)}
          />
        )}
        {showMinigame && currentGameType === 'battle' && (
          <BattleGame
            isVisible={showMinigame}
            onComplete={handleMinigameComplete}
            onClose={() => setShowMinigame(false)}
          />
        )}
        {showMinigame && currentGameType === 'candi' && (
          <CandiGame
            isVisible={showMinigame}
            onComplete={handleMinigameComplete}
            onClose={() => setShowMinigame(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}