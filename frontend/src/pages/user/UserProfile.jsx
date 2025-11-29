import React, { useState, useEffect } from 'react';
import UserProfileMobile from './UserProfileMobile';
import UserProfileDesktop from './UserProfileDesktop';

const UserProfile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <UserProfileMobile />;
  } else {
    return <UserProfileDesktop />;
  }
};

export default UserProfile;