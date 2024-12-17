import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { firestore, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function App() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isStaticMode, setIsStaticMode] = useState(false);

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);

  // Estado para o tamanho da imagem
  const [imageSize, setImageSize] = useState(50); // Tamanho inicial da imagem em pixels

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
      setSelectedImage(file);

      // Faz o upload da imagem imediatamente
      try {
        const user = auth.currentUser;
        if (!user) {
          alert('Você precisa estar logado para enviar imagens!');
          return;
        }

        const imageRef = ref(storage, `images/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const uploadedURL = await getDownloadURL(imageRef);

        // Atualiza a URL da imagem no estado
        setImageURL(uploadedURL);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
      }
    } else {
      alert('Por favor, selecione uma imagem no formato PNG ou SVG com fundo transparente.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <textarea
          placeholder="Insira o valor do QR Code"
          value={qrCodeValue}
          onChange={(e) => setQrCodeValue(e.target.value)}
          style={styles.input}
        />

        <div style={styles.colorPickerContainer}>
          <label>
            Cor do QR Code:
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              style={styles.colorPicker}
            />
          </label>
          <label>
            Cor de Fundo:
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              style={styles.colorPicker}
            />
          </label>
        </div>

        <div style={styles.imageUploadContainer}>
          <label>
            Escolha uma imagem para o QR Code:
            <input
              type="file"
              accept=".png,.svg"
              onChange={handleImageUpload}
              style={styles.imageInput}
            />
          </label>
        </div>

        <div style={styles.sliderContainer}>
          <label>
            Tamanho da imagem no QR Code: {imageSize}px
            <input
              type="range"
              min="20"
              max="100"
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              style={styles.slider}
            />
          </label>
        </div>

        {qrCodeValue && (
          <div style={styles.qrCodeContainer}>
            <QRCodeSVG
              value={qrCodeValue}
              size={150}
              fgColor={fgColor}
              bgColor="transparent"
              {...(imageURL && {
                imageSettings: {
                  src: imageURL,
                  x: undefined,
                  y: undefined,
                  height: imageSize,
                  width: imageSize,
                  excavate: true,
                },
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
  inputContainer: {
    margin: '20px auto',
  },
  colorPickerContainer: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  imageUploadContainer: {
    marginTop: '20px',
  },
  sliderContainer: {
    marginTop: '20px',
  },
  slider: {
    marginLeft: '10px',
    width: '100%',
  },
  qrCodeContainer: {
    marginTop: '20px',
    display: 'inline-block',
  },
};
