import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Book,
  Clock,
  Star,
  Trophy,
  User,
  MapPin,
  Heart,
  Sword,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  traits: string[];
  relationship: number;
  isUnlocked: boolean;
}

interface Location {
  id: string;
  name: string;
  description: string;
  significance: string;
  isUnlocked: boolean;
}

interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'history' | 'culture' | 'legend' | 'character';
  isUnlocked: boolean;
}

const characters: Character[] = [
  {
    id: 'roro_jonggrang',
    name: 'Roro Jonggrang',
    title: 'Putri Prambanan',
    description:
      'Putri cantik jelita yang terkenal akan kecantikannya namun memiliki sifat yang angkuh. Ia adalah anak dari Raja Baka yang memerintah Kerajaan Prambanan.',
    traits: ['Cantik', 'Angkuh', 'Cerdik', 'Pemberani'],
    relationship: 50,
    isUnlocked: false,
  },
  {
    id: 'bandung_bondowoso',
    name: 'Bandung Bondowoso',
    title: 'Pangeran Pengging',
    description:
      'Pangeran muda yang sakti mandraguna dari Kerajaan Pengging. Memiliki kekuatan magis yang luar biasa dan mampu memerintah jin serta makhluk halus.',
    traits: ['Sakti', 'Perkasa', 'Ambisius', 'Romantis'],
    relationship: 50,
    isUnlocked: false,
  },
  {
    id: 'raja_baka',
    name: 'Raja Baka',
    title: 'Raja Prambanan',
    description:
      'Raja yang bijaksana dan adil yang memerintah Kerajaan Prambanan. Ayah dari Roro Jonggrang yang sangat menyayangi putrinya.',
    traits: ['Bijaksana', 'Adil', 'Penyayang', 'Tegas'],
    relationship: 50,
    isUnlocked: false,
  },
];

const locations: Location[] = [
  {
    id: 'prambanan_palace',
    name: 'Istana Prambanan',
    description:
      'Istana megah yang menjadi pusat pemerintahan Kerajaan Prambanan. Dikenal dengan arsitektur yang indah dan kemewahan yang tiada tara.',
    significance:
      'Tempat tinggal Roro Jonggrang dan pusat kekuasaan Raja Baka.',
    isUnlocked: false,
  },
  {
    id: 'candi_complex',
    name: 'Kompleks Candi',
    description:
      'Area dimana seribu candi dibangun dalam satu malam oleh Bandung Bondowoso dengan bantuan para jin dan makhluk halus.',
    significance: 'Lokasi tantangan yang menentukan nasib Roro Jonggrang.',
    isUnlocked: false,
  },
  {
    id: 'pengging_kingdom',
    name: 'Kerajaan Pengging',
    description:
      'Kerajaan asal Bandung Bondowoso yang terkenal dengan kekuatan militer dan kemampuan magisnya.',
    significance: 'Tempat asal pangeran yang mengubah takdir Prambanan.',
    isUnlocked: false,
  },
];

const loreEntries: LoreEntry[] = [
  {
    id: 'prambanan_history',
    title: 'Sejarah Kerajaan Prambanan',
    content:
      'Kerajaan Prambanan adalah salah satu kerajaan terbesar di Jawa pada masa lampau. Dikenal dengan kemakmuran dan keindahan arsitekturnya, kerajaan ini menjadi pusat perdagangan dan kebudayaan.',
    category: 'history',
    isUnlocked: false,
  },
  {
    id: 'javanese_culture',
    title: 'Budaya Jawa Kuno',
    content:
      'Masyarakat Jawa kuno memiliki kepercayaan yang kuat terhadap kekuatan supernatural. Mereka percaya pada jin, roh halus, dan kekuatan magis yang dapat mempengaruhi kehidupan manusia.',
    category: 'culture',
    isUnlocked: false,
  },
  {
    id: 'temple_significance',
    title: 'Makna Candi dalam Budaya Jawa',
    content:
      'Candi bukan hanya bangunan ibadah, tetapi juga simbol kekuasaan dan spiritualitas. Pembangunan candi memerlukan keahlian tinggi dan dianggap sebagai persembahan kepada dewa.',
    category: 'culture',
    isUnlocked: false,
  },
  {
    id: 'legend_origins',
    title: 'Asal Usul Legenda',
    content:
      'Legenda Roro Jonggrang telah diturunkan secara lisan dari generasi ke generasi. Cerita ini mengajarkan tentang konsekuensi kesombongan dan pentingnya kebijaksanaan.',
    category: 'legend',
    isUnlocked: false,
  },
];

export default function LibraryScreen() {
  const [selectedTab, setSelectedTab] = useState<
    'characters' | 'locations' | 'lore'
  >('characters');
  const [charactersData, setCharactersData] = useState<Character[]>(characters);
  const [locationsData, setLocationsData] = useState<Location[]>(locations);
  const [loreData, setLoreData] = useState<LoreEntry[]>(loreEntries);

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      const chapterProgress = await AsyncStorage.getItem('chapterProgress');
      if (chapterProgress) {
        const progress = JSON.parse(chapterProgress);
        const completedChapters = Object.keys(progress)
          .filter((chapterId) => progress[chapterId].isCompleted)
          .map(Number);

        // Unlock content based on completed chapters
        setCharactersData((prev) =>
          prev.map((char) => ({
            ...char,
            isUnlocked: completedChapters.length > 0,
            relationship: progress[1]?.relationshipScore || 50,
          }))
        );

        setLocationsData((prev) =>
          prev.map((loc) => ({
            ...loc,
            isUnlocked: completedChapters.length > 0,
          }))
        );

        setLoreData((prev) =>
          prev.map((lore) => ({
            ...lore,
            isUnlocked: completedChapters.length > 0,
          }))
        );
      }
    } catch (error) {
      console.log('Error loading library data:', error);
    }
  };

  const tabs = [
    { id: 'characters', name: 'Karakter', icon: User },
    { id: 'locations', name: 'Lokasi', icon: MapPin },
    { id: 'lore', name: 'Pengetahuan', icon: Book },
  ];

  const renderTabButton = (tab: any) => {
    const IconComponent = tab.icon;
    const isSelected = selectedTab === tab.id;

    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tabButton, isSelected && styles.selectedTab]}
        onPress={() => setSelectedTab(tab.id)}
      >
        <IconComponent size={20} color={isSelected ? '#000' : '#D4AF37'} />
        <Text style={[styles.tabText, isSelected && styles.selectedTabText]}>
          {tab.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCharacter = (character: Character, index: number) => (
    <Animated.View
      key={character.id}
      entering={FadeInDown.delay(index * 100)}
      style={[styles.contentCard, !character.isUnlocked && styles.lockedCard]}
    >
      <View style={styles.characterHeader}>
        <View style={styles.characterInfo}>
          <Text
            style={[
              styles.characterName,
              !character.isUnlocked && styles.lockedText,
            ]}
          >
            {character.name}
          </Text>
          <Text
            style={[
              styles.characterTitle,
              !character.isUnlocked && styles.lockedText,
            ]}
          >
            {character.title}
          </Text>
        </View>

        {character.isUnlocked && (
          <View style={styles.relationshipMeter}>
            <Heart size={16} color="#D4AF37" />
            <Text style={styles.relationshipText}>
              {character.relationship}%
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.characterDescription,
          !character.isUnlocked && styles.lockedText,
        ]}
      >
        {character.isUnlocked
          ? character.description
          : 'Selesaikan chapter untuk membuka informasi karakter'}
      </Text>

      {character.isUnlocked && (
        <View style={styles.traitsContainer}>
          {character.traits.map((trait, traitIndex) => (
            <View key={traitIndex} style={styles.traitBadge}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const renderLocation = (location: Location, index: number) => (
    <Animated.View
      key={location.id}
      entering={FadeInDown.delay(index * 100)}
      style={[styles.contentCard, !location.isUnlocked && styles.lockedCard]}
    >
      <Text
        style={[styles.locationName, !location.isUnlocked && styles.lockedText]}
      >
        {location.name}
      </Text>

      <Text
        style={[
          styles.locationDescription,
          !location.isUnlocked && styles.lockedText,
        ]}
      >
        {location.isUnlocked
          ? location.description
          : 'Selesaikan chapter untuk membuka informasi lokasi'}
      </Text>

      {location.isUnlocked && (
        <View style={styles.significanceContainer}>
          <Text style={styles.significanceLabel}>Signifikansi:</Text>
          <Text style={styles.significanceText}>{location.significance}</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderLoreEntry = (entry: LoreEntry, index: number) => (
    <Animated.View
      key={entry.id}
      entering={FadeInDown.delay(index * 100)}
      style={[styles.contentCard, !entry.isUnlocked && styles.lockedCard]}
    >
      <View style={styles.loreHeader}>
        <Text
          style={[styles.loreTitle, !entry.isUnlocked && styles.lockedText]}
        >
          {entry.title}
        </Text>

        {entry.isUnlocked && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{entry.category}</Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.loreContent, !entry.isUnlocked && styles.lockedText]}
      >
        {entry.isUnlocked
          ? entry.content
          : 'Selesaikan chapter untuk membuka pengetahuan ini'}
      </Text>
    </Animated.View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'characters':
        return charactersData.map(renderCharacter);
      case 'locations':
        return locationsData.map(renderLocation);
      case 'lore':
        return loreData.map(renderLoreEntry);
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perpustakaan</Text>
        <Text style={styles.headerSubtitle}>
          Pelajari lebih dalam tentang dunia Roro Jonggrang
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabsScroll: {
    paddingRight: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  selectedTab: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
    marginLeft: 6,
  },
  selectedTabText: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  contentCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 20,
    marginBottom: 16,
  },
  lockedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  characterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
  },
  characterTitle: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#D4AF37',
    marginTop: 2,
  },
  relationshipMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  relationshipText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
    marginLeft: 4,
  },
  characterDescription: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  traitText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
  },
  locationName: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
    marginBottom: 12,
  },
  locationDescription: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
  },
  significanceContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  significanceLabel: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  significanceText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    lineHeight: 20,
    opacity: 0.9,
  },
  loreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loreTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
  },
  loreContent: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  lockedText: {
    opacity: 0.5,
  },
});
