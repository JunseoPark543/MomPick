import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import AppButton from '@/components/AppButton';
import AppTextInput from '@/components/AppTextInput';
import CheckRow from '@/components/CheckRow';
import FormScreen from '@/components/FormScreen';
import SegmentedTabs from '@/components/SegmentedTabs';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import {
  CONDITION_LABELS,
  CONDITIONS,
  MAX_IMAGES,
  USED_CATEGORIES,
  USED_CATEGORY_LABELS,
  deleteUsedImages,
  uploadUsedImage,
  type UsedCategory,
  type UsedCondition,
} from '@/lib/used';
import { supabase } from '@/lib/supabase';

export default function NewUsedItemScreen() {
  const { session } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<UsedCategory>('stroller');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<UsedCondition>('good');
  const [size, setSize] = useState('');
  const [usagePeriod, setUsagePeriod] = useState('');
  const [description, setDescription] = useState('');
  const [safePay, setSafePay] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 1,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, MAX_IMAGES));
    }
  }

  async function handleSubmit() {
    const priceNumber = isFree ? 0 : Number(price.replace(/[^0-9]/g, ''));
    if (images.length === 0) return setErrorMessage('사진을 1장 이상 올려 주세요.');
    if (!title.trim()) return setErrorMessage('제목을 입력해 주세요.');
    if (!isFree && !priceNumber) return setErrorMessage('가격을 입력하거나 나눔을 선택해 주세요.');
    if (!session) return;

    setSaving(true);
    setErrorMessage('');
    const uploaded: string[] = [];
    try {
      for (const uri of images) {
        uploaded.push(await uploadUsedImage(session.user.id, uri));
      }
      const { data, error } = await supabase
        .from('used_items')
        .insert({
          title: title.trim(),
          category,
          price: priceNumber,
          condition,
          size: size.trim() || null,
          usage_period: usagePeriod.trim() || null,
          description: description.trim(),
          safe_pay_available: safePay,
          image_paths: uploaded,
        })
        .select('id')
        .single();
      if (error || !data) throw error ?? new Error('insert failed');
      router.replace({ pathname: '/used/[id]', params: { id: data.id } });
    } catch {
      // 글 등록에 실패하면 올려둔 사진도 지운다
      await deleteUsedImages(uploaded);
      setErrorMessage('등록하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.');
      setSaving(false);
    }
  }

  return (
    <FormScreen>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
        {images.length < MAX_IMAGES ? (
          <Pressable accessibilityRole="button" onPress={pickImages} style={styles.addPhoto}>
            <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
            <Text style={styles.photoCount}>
              {images.length}/{MAX_IMAGES}
            </Text>
          </Pressable>
        ) : null}
        {images.map((uri, i) => (
          <View key={uri}>
            <Image source={{ uri }} style={styles.photo} />
            {i === 0 ? <Text style={styles.coverLabel}>대표 사진</Text> : null}
            <Pressable
              accessibilityLabel="사진 빼기"
              onPress={() => setImages((prev) => prev.filter((u) => u !== uri))}
              style={styles.removePhoto}
              hitSlop={8}>
              <Ionicons name="close-circle" size={24} color={colors.text} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <AppTextInput label="제목" value={title} onChangeText={setTitle} placeholder="예: 절충형 유모차 팝니다" maxLength={60} />

      <View style={styles.section}>
        <Text style={styles.label}>카테고리</Text>
        <View style={styles.bleed}>
          <SegmentedTabs<UsedCategory>
            value={category}
            onChange={setCategory}
            options={USED_CATEGORIES.map((c) => ({ value: c, label: USED_CATEGORY_LABELS[c] }))}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>가격</Text>
        {isFree ? null : (
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="₩ 가격을 입력해 주세요"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={styles.input}
          />
        )}
        <CheckRow label="나눔할게요 (무료)" checked={isFree} onToggle={() => setIsFree((v) => !v)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>상태</Text>
        <View style={styles.bleed}>
          <SegmentedTabs<UsedCondition>
            value={condition}
            onChange={setCondition}
            options={CONDITIONS.map((c) => ({ value: c, label: CONDITION_LABELS[c] }))}
          />
        </View>
      </View>

      <View style={styles.twoCols}>
        <View style={styles.col}>
          <AppTextInput label="사이즈 (선택)" value={size} onChangeText={setSize} placeholder="예: 80, 신생아용" maxLength={30} />
        </View>
        <View style={styles.col}>
          <AppTextInput
            label="사용 기간 (선택)"
            value={usagePeriod}
            onChangeText={setUsagePeriod}
            placeholder="예: 6개월"
            maxLength={30}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>자세한 설명</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={'구매 시기, 하자 여부, 거래 희망 장소 등을 적어 주세요.\n아이 얼굴이 나온 사진은 올리지 말아 주세요.'}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
          textAlignVertical="top"
          style={[styles.input, styles.description]}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>거래 방식</Text>
        <Text style={styles.hint}>만나서 하는 직거래는 항상 무료로 가능해요.</Text>
        <CheckRow label="앱 안 안전결제도 받을게요" checked={safePay} onToggle={() => setSafePay((v) => !v)} />
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <AppButton title={saving ? '올리는 중…' : '등록하기'} onPress={handleSubmit} loading={saving} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  photos: {
    gap: 10,
    paddingVertical: 4,
  },
  addPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  photoCount: {
    fontSize: 13,
    color: colors.textMuted,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  coverLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    fontSize: 11,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 2,
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  bleed: {
    marginHorizontal: -24,
    paddingHorizontal: 8,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  description: {
    minHeight: 160,
    paddingTop: 14,
    lineHeight: 26,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
});
