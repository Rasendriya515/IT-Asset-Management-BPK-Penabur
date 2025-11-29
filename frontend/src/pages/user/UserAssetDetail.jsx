import React, { useState, useEffect } from 'react';
import MobileAssetDetail from './MobileAssetDetail';
import DesktopAssetDetail from './DesktopAssetDetail';

const UserAssetDetail = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <MobileAssetDetail />;
  } else {
    return <DesktopAssetDetail />;
  }
};

export default UserAssetDetail;