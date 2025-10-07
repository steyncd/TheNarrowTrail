import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useFavorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (currentUser) {
      const storageKey = `hiking-portal-favorites-${currentUser.id}`;
      const savedFavorites = localStorage.getItem(storageKey);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error('Error loading favorites:', e);
          setFavorites([]);
        }
      }
    }
  }, [currentUser]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (currentUser) {
      const storageKey = `hiking-portal-favorites-${currentUser.id}`;
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    }
  }, [favorites, currentUser]);

  const addFavorite = (hikeId) => {
    if (!favorites.includes(hikeId)) {
      setFavorites([...favorites, hikeId]);
    }
  };

  const removeFavorite = (hikeId) => {
    setFavorites(favorites.filter(id => id !== hikeId));
  };

  const toggleFavorite = (hikeId) => {
    if (favorites.includes(hikeId)) {
      removeFavorite(hikeId);
    } else {
      addFavorite(hikeId);
    }
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
