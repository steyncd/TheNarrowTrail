import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useFavorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const isInitialized = useRef(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (currentUser && !isInitialized.current) {
      const storageKey = `hiking-portal-favorites-${currentUser.id}`;
      const savedFavorites = localStorage.getItem(storageKey);
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          // Ensure it's an array and contains valid data
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          } else {
            console.warn('Invalid favorites data in localStorage, resetting to empty array');
            setFavorites([]);
          }
        } catch (e) {
          console.error('Error loading favorites:', e);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
      isInitialized.current = true;
    }
  }, [currentUser]);

  // Save favorites to localStorage whenever they change (but only after initialization)
  useEffect(() => {
    if (currentUser && isInitialized.current) {
      const storageKey = `hiking-portal-favorites-${currentUser.id}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(favorites));
      } catch (e) {
        console.error('Error saving favorites:', e);
      }
    }
  }, [favorites, currentUser]);

  const addFavorite = (hikeId) => {
    setFavorites(prevFavorites => {
      // Prevent duplicates
      if (prevFavorites.includes(hikeId)) {
        return prevFavorites;
      }
      return [...prevFavorites, hikeId];
    });
  };

  const removeFavorite = (hikeId) => {
    setFavorites(prevFavorites => prevFavorites.filter(id => id !== hikeId));
  };

  const toggleFavorite = (hikeId) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(hikeId)) {
        return prevFavorites.filter(id => id !== hikeId);
      } else {
        return [...prevFavorites, hikeId];
      }
    });
  };

  const isFavorite = (hikeId) => {
    return favorites.includes(hikeId);
  };

  const getFavorites = () => {
    return favorites;
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavorites
  };
};

export default useFavorites;
