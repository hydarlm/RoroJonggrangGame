import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Halaman Tidak Ditemukan' }} />
      <LinearGradient
        colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
        style={styles.container}
      >
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Halaman Tidak Ditemukan</Text>
        <Text style={styles.description}>
          Sepertinya Anda tersesat di dalam cerita. Mari kembali ke awal
          petualangan.
        </Text>
        <Link href="/" style={styles.link}>
          <View style={styles.linkButton}>
            <ArrowLeft size={20} color="#000" />
            <Text style={styles.linkText}>Kembali ke Beranda</Text>
          </View>
        </Link>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 72,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 24,
  },
  link: {
    marginTop: 15,
  },
  linkButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#000',
    marginLeft: 8,
  },
});
