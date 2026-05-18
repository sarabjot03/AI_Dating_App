import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import {
  PHOTO_CLIENT_JPEG_QUALITY,
  PHOTO_CLIENT_MAX_WIDTH_PX,
  PHOTO_UPLOAD_COPY,
  PHOTOS_UPLOAD_MAX,
  PHOTOS_UPLOAD_MIN,
} from '@/constants/profile-generation';
import {
  deleteProfilePhoto,
  fetchProfilePhotos,
  uploadProfilePhoto,
  type ProfilePhoto,
} from '@/lib/profile-photos-api';

export default function PhotoUploadScreen() {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProfilePhotos();
      setPhotos(data.photos);
    } catch {
      Alert.alert('Could not load photos', 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const canContinue = photos.length >= PHOTOS_UPLOAD_MIN;
  const atMax = photos.length >= PHOTOS_UPLOAD_MAX;
  const busy = uploading || removingId !== null;

  async function pickAndUpload() {
    if (atMax || busy) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add profile photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: PHOTO_CLIENT_MAX_WIDTH_PX } }],
        { compress: PHOTO_CLIENT_JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
      );
      const uploaded = await uploadProfilePhoto(manipulated.uri, 'image/jpeg');
      setPhotos((prev) => [...prev, uploaded].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      Alert.alert('Upload failed', 'Try again or pick a smaller photo.');
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photo: ProfilePhoto) {
    if (busy) return;
    setRemovingId(photo.id);
    try {
      await deleteProfilePhoto(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch {
      Alert.alert('Could not remove photo', 'Try again.');
    } finally {
      setRemovingId(null);
    }
  }

  function onContinue() {
    if (!canContinue || busy) return;
    router.push('/(onboarding)/profile');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: Brand.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.back, { color: Brand.pink }]}>Back</Text>
        </Pressable>
        <Text style={[styles.counter, { color: Brand.textMuted }]}>
          {PHOTO_UPLOAD_COPY.generateHint(photos.length)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: Brand.pink }]}>Step 2</Text>
        <Text style={[styles.title, { color: Brand.text }]}>{PHOTO_UPLOAD_COPY.title}</Text>
        <Text style={[styles.subtitle, { color: Brand.textSecondary }]}>{PHOTO_UPLOAD_COPY.subtitle}</Text>

        {PHOTO_UPLOAD_COPY.rules.map((rule) => (
          <Text key={rule} style={[styles.rule, { color: Brand.textMuted }]}>
            • {rule}
          </Text>
        ))}

        {loading ? (
          <ActivityIndicator size="large" color={Brand.pink} style={styles.loader} />
        ) : (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.tile}>
                <Image source={{ uri: photo.thumbnailUrl }} style={styles.tileImg} contentFit="cover" />
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => void removePhoto(photo)}
                  disabled={busy}
                  hitSlop={8}>
                  {removingId === photo.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.removeX}>×</Text>
                  )}
                </Pressable>
              </View>
            ))}
            {!atMax ? (
              <Pressable
                style={[styles.addTile, busy && styles.tileDisabled]}
                onPress={() => void pickAndUpload()}
                disabled={busy}>
                {uploading ? (
                  <ActivityIndicator color={Brand.pink} />
                ) : (
                  <>
                    <Text style={[styles.addPlus, { color: Brand.pink }]}>+</Text>
                    <Text style={[styles.addLabel, { color: Brand.textMuted }]}>Add photo</Text>
                  </>
                )}
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={onContinue}
          disabled={!canContinue || busy}
          style={[styles.primary, { backgroundColor: Brand.pink, opacity: canContinue && !busy ? 1 : 0.45 }]}>
          <Text style={styles.primaryLabel}>
            {canContinue ? 'Continue to profile preview' : `Add ${PHOTOS_UPLOAD_MIN - photos.length} more`}
          </Text>
        </Pressable>
        <Text style={[styles.footerNote, { color: Brand.textMuted }]}>
          AI photo pick + captions ship in the next update. For now, review your text profile next.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: { fontSize: 17, fontWeight: '600' },
  counter: { fontSize: 14, fontWeight: '600' },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  kicker: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 6 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 12 },
  rule: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  loader: { marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  tile: {
    width: '31%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Brand.surfaceElevated,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  tileImg: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeX: { color: '#fff', fontSize: 20, lineHeight: 22, fontWeight: '300' },
  addTile: {
    width: '31%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surfaceElevated,
  },
  tileDisabled: { opacity: 0.5 },
  addPlus: { fontSize: 32, fontWeight: '300' },
  addLabel: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  footer: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
  primary: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryLabel: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footerNote: { fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 18 },
});
