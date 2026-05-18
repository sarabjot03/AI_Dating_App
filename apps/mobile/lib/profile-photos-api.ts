import { apiFetch } from '@/lib/api';

export type ProfilePhoto = {
  id: string;
  url: string;
  thumbnailUrl: string;
  sortOrder: number;
  width: number | null;
  height: number | null;
  caption: string | null;
  isSelected: boolean;
  createdAt: string;
};

export async function fetchProfilePhotos(): Promise<{
  photos: ProfilePhoto[];
  count: number;
  max: number;
}> {
  const res = await apiFetch('/profile/photos');
  return res.json();
}

export async function uploadProfilePhoto(localUri: string, mimeType = 'image/jpeg'): Promise<ProfilePhoto> {
  const formData = new FormData();
  const name = `photo-${Date.now()}.jpg`;
  formData.append('file', {
    uri: localUri,
    name,
    type: mimeType,
  } as unknown as Blob);

  const res = await apiFetch('/profile/photos', {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function deleteProfilePhoto(photoId: string): Promise<void> {
  await apiFetch(`/profile/photos/${photoId}`, { method: 'DELETE' });
}
