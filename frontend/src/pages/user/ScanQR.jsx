import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

const ScanQR = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    const readerId = "reader";

    let isComponentMounted = true;

    const existingContainer = document.getElementById(readerId);
    if (existingContainer) {
        existingContainer.innerHTML = "";
    }

    const html5QrCode = new Html5Qrcode(readerId);
    scannerRef.current = html5QrCode;

    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    const startScanner = async () => {
        try {
            await html5QrCode.start(
                { facingMode: "environment" }, 
                config,
                (decodedText) => {
                    if (isComponentMounted) {
                        handleScanSuccess(decodedText, html5QrCode);
                    }
                },
                (errorMessage) => {
                }
            );

            if (!isComponentMounted) {
                console.log("⚠️ Kamera hantu terdeteksi! Mematikan kamera segera...");
                await html5QrCode.stop();
                html5QrCode.clear();
                return;
            }

            setIsScanning(true);
            setErrorMsg('');

        } catch (err) {
            if (isComponentMounted) {
                setIsScanning(false);
                const errString = err?.toString() || "";
                if (errString.includes("Permission") || errString.includes("Access")) {
                    setErrorMsg("Izin kamera ditolak. Mohon izinkan akses kamera di browser.");
                } else {

                    console.log("Scanner start warning:", err);
                }
            }
        }
    };

    startScanner();

    return () => {
        isComponentMounted = false;

        // Coba stop kamera jika statusnya sedang scanning
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop()
                .then(() => {
                    console.log("Camera stopped on cleanup.");
                    html5QrCode.clear();
                })
                .catch(err => {
                    console.warn("Cleanup stop warning:", err);
                });
        }
    };
  }, []);

  const handleScanSuccess = (decodedText, scannerInstance) => {
    if(scannerInstance) {
        try { scannerInstance.pause(); } catch(e){}
    }

    let targetUrl = "";
    if (decodedText.includes('/scan-asset/')) {
        const parts = decodedText.split('/scan-asset/');
        const barcode = parts[1];
        targetUrl = `/scan-asset/${barcode}`; 
    } else {
        targetUrl = `/scan-asset/${decodedText}`;
    }

    if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance.stop().then(() => {
            scannerInstance.clear();
            navigate(targetUrl);
        }).catch(() => {
            navigate(targetUrl);
        });
    } else {
        navigate(targetUrl);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Scan QR Aset</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-lg mx-auto">
            <div className="relative bg-black rounded-lg overflow-hidden min-h-[300px]">
                {/* ID Wadah Kamera */}
                <div id="reader" className="w-full h-full"></div>
                
                {/* Overlay Loading */}
                {!isScanning && !errorMsg && (
                    <div className="absolute inset-0 flex items-center justify-center text-white z-10 pointer-events-none">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm">Membuka Kamera...</p>
                        </div>
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center border border-red-200">
                    ⚠️ {errorMsg}
                </div>
            )}
            
            <div className="mt-4 text-center text-sm text-gray-500">
                <p>Arahkan kamera ke QR Code aset.</p>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ScanQR;