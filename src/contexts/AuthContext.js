'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { generateSalt, hashPassword, arrayBufferToBase64 } from '@/utils/encryption';

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
  userSalt: null, // For encryption key derivation
  isEmailVerified: false
};

// Actions
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload.user, 
        userSalt: action.payload.userSalt,
        isEmailVerified: action.payload.user?.emailVerified || false,
        loading: false,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SIGN_OUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user's encryption salt from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          dispatch({
            type: 'SET_USER',
            payload: {
              user,
              userSalt: userData?.encryptionSalt ? userData.encryptionSalt : null
            }
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch({
            type: 'SET_USER',
            payload: { user, userSalt: null }
          });
        }
      } else {
        dispatch({ type: 'SIGN_OUT' });
      }
    });

    return unsubscribe;
  }, []);

  // Sign up function
  const signUp = async (email, password, displayName) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName });

      // Generate encryption salt for this user
      const encryptionSalt = generateSalt();
      const saltBase64 = arrayBufferToBase64(encryptionSalt);

      // Generate password hash for additional security (optional)
      const passwordHash = await hashPassword(password, encryptionSalt);

      // Store user data in Firestore (salt is needed for encryption/decryption)
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName,
        encryptionSalt: saltBase64,
        passwordHash: passwordHash, // For additional verification if needed
        createdAt: new Date().toISOString(),
        emailVerified: false,
        preferences: {
          theme: 'light',
          autoSave: true,
          wordCount: true
        }
      });

      // Send email verification
      await sendEmailVerification(user);

      return { success: true, message: 'Account created successfully! Please verify your email.' };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'SIGN_OUT' });
      return { success: true };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent successfully!' };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Resend email verification
  const resendEmailVerification = async () => {
    try {
      if (state.user) {
        await sendEmailVerification(state.user);
        return { success: true, message: 'Verification email sent successfully!' };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    ...state,
    signUp,
    signIn,
    logout,
    resetPassword,
    resendEmailVerification,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to get user-friendly error messages
function getFirebaseErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/requires-recent-login':
      return 'Please log in again to complete this action.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
