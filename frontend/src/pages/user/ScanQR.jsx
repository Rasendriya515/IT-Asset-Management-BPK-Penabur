import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const ScanQR = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
        supportedScanTypes: [] 
      },
      false
    );

    const onScanSuccess = (decodedText) => {
      try {
        const linkMatch = decodedText.match(/Link:\s*(.*)/);
        
        if (linkMatch && linkMatch[1]) {
          const fullUrl = linkMatch[1].trim();
          const urlObj = new URL(fullUrl);
          const pathParts = urlObj.pathname.split('/');
          const assetId = pathParts[pathParts.length - 1];

          if (assetId && !isNaN(assetId)) {
            scanner.clear();
            navigate(`/user/asset/${assetId}`);
          } else {
            setError("QR Code tidak valid (ID tidak ditemukan).");
          }
        } else {
          if (decodedText.includes('/mobile/asset/') || decodedText.includes('/user/asset/')) {
             const urlParts = decodedText.split('/');
             const id = urlParts[urlParts.length - 1];
             scanner.clear();
             navigate(`/user/asset/${id}`);
          } else {
             setError("Ini bukan QR Code Aset BPK Penabur.");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memproses QR Code.");
      }
    };

    const onScanFailure = (error) => {};

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear html5qrcode", error));
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <button 
        onClick={() => navigate('/user/home')}
        className="absolute top-6 left-6 z-10 bg-white/20 p-2 rounded-full text-white backdrop-blur-sm hover:bg-white/30"
      >
        <ArrowLeft size={24} />
      </button>

      <h2 className="text-white font-bold text-xl mb-8 z-10 tracking-wide">Scan QR Aset</h2>

      <div className="w-full max-w-sm px-4 relative z-0">
        <div id="reader" className="bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-penabur-blue"></div>
        <p className="text-gray-400 text-center text-xs mt-4">Arahkan kamera ke QR Code yang tertempel di aset.</p>
      </div>

      {error && (
        <div className="absolute bottom-10 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-bounce">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ScanQR;