import React, { useState } from 'react';
import MyLoader from './MyLoader';
import { uploadToCloudinary } from '../../lib/uploadToCloudinary';
import { registerables } from 'chart.js';

const ImageUploader = ({
  onImageUploaded,
  buttonText,
}: {
  onImageUploaded: (urls: string[]) => any;
  buttonText?: string;
}) => {
  const [uploadingImages, setUploadingImages] = useState(false);
  const getImageFromDevice = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', 'false');
    input.setAttribute('name', 'profile[photo]');
    input.setAttribute('id', 'profile_photo');
    input.click();
    input.onchange = async function () {
      const files = input.files;
      setUploadingImages(true);
      const urls = await uploadToCloudinary(files);
      setUploadingImages(false);
      onImageUploaded(urls);
    };
  };
  return (
    <div className='ImageUploader'>
      {uploadingImages && <MyLoader />}
      <button onClick={getImageFromDevice} style={{ color: 'rgb(50,50,50)' }}>
        {buttonText || 'Upload Profile Image'}
      </button>
    </div>
  );
};

export default ImageUploader;
