import React, { useState, useEffect } from 'react';
import MobileAssetList from './MobileAssetList';
import DesktopAssetList from './DesktopAssetList';

const UserAssetList = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <MobileAssetList />;
  } else {
    return <DesktopAssetList />;
  }
};

export default UserAssetList;