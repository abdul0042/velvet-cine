import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, isGuest, uid }
  const [library, setLibrary] = useState({ watchlist: [], watched: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ username: firebaseUser.displayName || 'User', isGuest: false, uid: firebaseUser.uid });
        await loadUserLibrary(firebaseUser.uid);
      } else {
        // Check if guest is in local storage
        const guestData = localStorage.getItem('velvet_guest_user');
        if (guestData) {
          setUser(JSON.parse(guestData));
          const guestLibrary = localStorage.getItem('velvet_data_Guest');
          if (guestLibrary) setLibrary(JSON.parse(guestLibrary));
        } else {
          setUser(null);
          setLibrary({ watchlist: [], watched: [] });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserLibrary = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLibrary({ watchlist: data.watchlist || [], watched: data.watched || [] });
      } else {
        const newLibrary = { watchlist: [], watched: [] };
        await setDoc(docRef, newLibrary);
        setLibrary(newLibrary);
      }
    } catch (error) {
      console.error("Error loading library:", error);
      toast.error("Failed to load library from cloud.");
    }
  };

  const saveUserLibrary = async (newLibrary) => {
    setLibrary(newLibrary);
    if (user && !user.isGuest && user.uid) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, newLibrary);
      } catch (error) {
        console.error("Error saving to cloud:", error);
      }
    } else if (user && user.isGuest) {
      localStorage.setItem('cinevault_data_Guest', JSON.stringify(newLibrary));
    }
  };

  const register = async (username, password) => {
    try {
      // Firebase requires an email prefix. We'll use a safer encoding for usernames.
      // We'll also append the project ID to avoid collisions across different projects using the same logic.
      const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${safeUsername}@velvet-${auth.app.options.projectId}.app`;
      
      console.log("Attempting registration with internal identifier:", email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      
      const newLibrary = { watchlist: [], watched: [], email, username };
      await setDoc(doc(db, 'users', userCredential.user.uid), newLibrary);
      
      setUser({ username, isGuest: false, uid: userCredential.user.uid });
      setLibrary({ watchlist: [], watched: [] });
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.error("Firebase Registration Error FULL:", error);
      let message = "Registration failed.";
      if (error.code === 'auth/email-already-in-use') message = "This username is already taken.";
      else if (error.code === 'auth/weak-password') message = "Password is too weak.";
      else if (error.code === 'auth/invalid-email') message = "Internal error: Invalid username format.";
      else if (error.message) message = error.message;
      
      toast.error(message);
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${safeUsername}@velvet-${auth.app.options.projectId}.app`;
      
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('velvet_guest_user');
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      console.error("Firebase Login Error FULL:", error);
      let message = "Login failed.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Incorrect username or password.";
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
      return false;
    }
  };

  const loginAsGuest = () => {
    const guestUser = { username: 'Guest', isGuest: true };
    setUser(guestUser);
    localStorage.setItem('velvet_guest_user', JSON.stringify(guestUser));
    
    // Load local guest storage if exists
    const guestLibrary = localStorage.getItem('velvet_data_Guest');
    if (guestLibrary) {
      setLibrary(JSON.parse(guestLibrary));
    } else {
      setLibrary({ watchlist: [], watched: [] });
    }
    toast.success('Browsing as Guest');
  };

  const logout = async () => {
    try {
      if (!user?.isGuest) {
        await signOut(auth);
      }
      setUser(null);
      setLibrary({ watchlist: [], watched: [] });
      localStorage.removeItem('velvet_guest_user');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const addToWatchlist = (item) => {
    if (!user || user.isGuest) {
      toast.error('Browsing as Guest: Saves are temporary.');
    }
    if (library.watchlist.find(m => (m.mal_id || m.id) === (item.mal_id || item.id))) {
      toast.error('Already in watchlist');
      return;
    }
    
    // Remove from watched if it's there
    const newWatched = library.watched.filter(m => (m.mal_id || m.id) !== (item.mal_id || item.id));
    const newLibrary = {
      ...library,
      watchlist: [...library.watchlist, item],
      watched: newWatched
    };
    
    saveUserLibrary(newLibrary);
    toast.success('Added to Watchlist');
  };

  const removeFromWatchlist = (id) => {
    const newLibrary = {
      ...library,
      watchlist: library.watchlist.filter(m => (m.mal_id || m.id) !== id)
    };
    saveUserLibrary(newLibrary);
    toast.success('Removed from Watchlist');
  };

  const markAsWatched = (item, rating = 0, review = '') => {
    const watchedItem = { ...item, userRating: rating, userReview: review, dateWatched: new Date().toISOString() };
    const id = item.mal_id || item.id;
    
    const newLibrary = {
      watchlist: library.watchlist.filter(m => (m.mal_id || m.id) !== id),
      watched: [...library.watched.filter(m => (m.mal_id || m.id) !== id), watchedItem]
    };
    
    saveUserLibrary(newLibrary);
    toast.success('Marked as Watched');
  };

  const updateWatchedRecord = (id, rating, review) => {
    const newLibrary = {
      ...library,
      watched: library.watched.map(m => 
        (m.mal_id || m.id) === id 
          ? { ...m, userRating: rating, userReview: review } 
          : m
      )
    };
    saveUserLibrary(newLibrary);
    toast.success('Rating updated');
  };

  const removeFromWatched = (id) => {
    const newLibrary = {
      ...library,
      watched: library.watched.filter(m => (m.mal_id || m.id) !== id)
    };
    saveUserLibrary(newLibrary);
    toast.success('Removed from Watched List');
  };

  const value = {
    user,
    library,
    register,
    login,
    loginAsGuest,
    logout,
    addToWatchlist,
    removeFromWatchlist,
    markAsWatched,
    updateWatchedRecord,
    removeFromWatched,
    isInWatchlist: (id) => library.watchlist.some(m => (m.mal_id || m.id) === id),
    isWatched: (id) => library.watched.some(m => (m.mal_id || m.id) === id),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
