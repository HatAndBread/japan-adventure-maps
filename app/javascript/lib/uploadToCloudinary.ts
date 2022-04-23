const url = 'https://api.cloudinary.com/v1_1/hatandbread/image/upload';

export const uploadToCloudinary = async (files: Blob[] | FileList) => {
  const formData = new FormData();
  const urls = [];
  for (const file of Array.from(files)) {
    formData.append('file', file);
    formData.append('upload_preset', 'hfcphzz7');
    const res = await fetch(`https://api.cloudinary.com/v1_1/hatandbread/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    urls.push(data.secure_url);
  }
  return urls;
};
