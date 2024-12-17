import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { firestore, auth, storage } from './firebase';
import { collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function App() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isStaticMode, setIsStaticMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState('text');
  const [documentId, setDocumentId] = useState(null);

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);

  // Estado para o tamanho da imagem
  const [imageSize, setImageSize] = useState(50); // Tamanho inicial da imagem em pixels

  const placeholders = {
    text: 'Insira o texto',
    link: 'Insira o link (https://)',
    telefone: 'Insira o número de telefone',
    whatsapp: 'Insira o número do WhatsApp',
    contato: 'Insira as informações de contato',
    wifi: 'Insira os dados do Wi-Fi',
    instagram: 'Insira o nome de usuário do Instagram',
    youtube: 'Insira o link do canal ou vídeo do YouTube',
    email: 'Insira o endereço de e-mail',
    facebook: 'Insira o link ou nome do perfil no Facebook',
    messenger: 'Insira o nome do usuário no Messenger',
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
      setSelectedImage(file);
    } else {
      alert('Por favor, selecione uma imagem no formato PNG ou SVG com fundo transparente.');
    }
  };

  const handleGenerateQRCode = async () => {
    if (!qrCodeValue.trim()) {
      alert('Por favor, insira um valor para o QR Code!');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Você precisa estar logado para gerar QR Codes!');
      return;
    }

    let uploadedImageURL = null;

    if (selectedImage) {
      try {
        const imageRef = ref(storage, `images/${user.uid}/${Date.now()}_${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        uploadedImageURL = await getDownloadURL(imageRef);
        setImageURL(uploadedImageURL);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
        return;
      }
    }

    // Lógica para salvar o QR Code no Firestore (omiti para manter o foco no slider)
    setQrCodeData({ qrCodeValue });
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <textarea
          placeholder={placeholders[selectedMode]}
          value={qrCodeValue}
          onChange={(e) => setQrCodeValue(e.target.value)}
          style={styles.input}
        />

        <button style={styles.generateButton} onClick={handleGenerateQRCode}>
          Gerar QR Code
        </button>

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

        {/* Adicionar slider para o tamanho da imagem */}
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

        {qrCodeData && (
          <div style={styles.qrCodeContainer}>
            <QRCodeSVG
              value={qrCodeData.qrCodeValue}
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
  generateButton: {
    margin: '10px 0',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
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
