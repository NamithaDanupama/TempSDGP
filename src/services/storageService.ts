import { Lesson, LessonFormData, LessonItem } from '@/types/lesson';
import localforage from 'localforage';

// Configure localForage to use IndexedDB
localforage.config({
  name: 'MochiApp',
  storeName: 'lessons',
});

// Separate store for images to avoid bloating lesson objects
const imageStore = localforage.createInstance({
  name: 'MochiApp',
  storeName: 'images',
});

const LESSONS_KEY = 'lessons';

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// --- Image helpers ---

export const storeImage = async (base64Data: string): Promise<string> => {
  if (!base64Data || !base64Data.startsWith('data:')) return base64Data;
  const imageId = `img_${generateId()}`;
  await imageStore.setItem(imageId, base64Data);
  return imageId;
};

export const getImage = async (imageRef: string): Promise<string> => {
  if (!imageRef) return '';
  // If it's already base64, return as-is
  if (imageRef.startsWith('data:')) return imageRef;
  // If it starts with img_, fetch from store
  if (imageRef.startsWith('img_')) {
    const data = await imageStore.getItem<string>(imageRef);
    return data || '';
  }
  return imageRef;
};

export const deleteImage = async (imageRef: string): Promise<void> => {
  if (imageRef && imageRef.startsWith('img_')) {
    await imageStore.removeItem(imageRef);
  }
};

// Extract images from lesson items and store them separately
const extractAndStoreImages = async (
  items: Omit<LessonItem, 'id' | 'order'>[],
  coverImage: string
): Promise<{ storedItems: Omit<LessonItem, 'id' | 'order'>[]; storedCover: string }> => {
  const storedCover = await storeImage(coverImage);
  const storedItems = await Promise.all(
    items.map(async (item) => ({
      ...item,
      image: await storeImage(item.image),
    }))
  );
  return { storedItems, storedCover };
};

// --- CRUD operations (all async) ---

export const getLessons = async (): Promise<Lesson[]> => {
  const lessons = await localforage.getItem<Lesson[]>(LESSONS_KEY);
  return lessons || [];
};

export const getLessonById = async (id: string): Promise<Lesson | undefined> => {
  const lessons = await getLessons();
  return lessons.find((lesson) => lesson.id === id);
};

// Resolve all image references in a lesson to base64 for display
export const resolveLessonImages = async (lesson: Lesson): Promise<Lesson> => {
  const coverImage = await getImage(lesson.coverImage);
  const items = await Promise.all(
    lesson.items.map(async (item) => ({
      ...item,
      image: await getImage(item.image),
    }))
  );
  return { ...lesson, coverImage, items };
};

export const createLesson = async (formData: LessonFormData): Promise<Lesson> => {
  const lessons = await getLessons();
  const { storedItems, storedCover } = await extractAndStoreImages(formData.items, formData.coverImage);

  const newLesson: Lesson = {
    id: generateId(),
    title: formData.title,
    description: formData.description,
    coverImage: storedCover,
    items: storedItems.map((item, index) => ({
      ...item,
      id: generateId(),
      order: index,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await localforage.setItem(LESSONS_KEY, [...lessons, newLesson]);
  return newLesson;
};

export const updateLesson = async (id: string, formData: LessonFormData): Promise<Lesson | undefined> => {
  const lessons = await getLessons();
  const index = lessons.findIndex((lesson) => lesson.id === id);
  if (index === -1) return undefined;

  // Clean up old images
  const oldLesson = lessons[index];
  await deleteImage(oldLesson.coverImage);
  for (const item of oldLesson.items) {
    await deleteImage(item.image);
  }

  const { storedItems, storedCover } = await extractAndStoreImages(formData.items, formData.coverImage);

  const updatedLesson: Lesson = {
    ...lessons[index],
    title: formData.title,
    description: formData.description,
    coverImage: storedCover,
    items: storedItems.map((item, idx) => ({
      ...item,
      id: generateId(),
      order: idx,
    })),
    updatedAt: new Date().toISOString(),
  };

  lessons[index] = updatedLesson;
  await localforage.setItem(LESSONS_KEY, lessons);
  return updatedLesson;
};

export const deleteLesson = async (id: string): Promise<boolean> => {
  const lessons = await getLessons();
  const lesson = lessons.find((l) => l.id === id);

  if (lesson) {
    // Clean up images
    await deleteImage(lesson.coverImage);
    for (const item of lesson.items) {
      await deleteImage(item.image);
    }
  }

  const filtered = lessons.filter((lesson) => lesson.id !== id);
  if (filtered.length === lessons.length) return false;

  await localforage.setItem(LESSONS_KEY, filtered);
  return true;
};
