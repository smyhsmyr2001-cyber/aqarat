// Firebase Authentication Helper Functions

// Global variables for Firebase services (will be available after firebase-config.js loads)
let auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword;

// Initialize Firebase services when available
function initializeFirebaseAuth() {
  if (window.firebaseServices) {
    auth = window.firebaseServices.auth;
    createUserWithEmailAndPassword = window.firebaseServices.createUserWithEmailAndPassword;
    signInWithEmailAndPassword = window.firebaseServices.signInWithEmailAndPassword;
    signOut = window.firebaseServices.signOut;
    onAuthStateChanged = window.firebaseServices.onAuthStateChanged;
    updatePassword = window.firebaseServices.updatePassword;
    
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in:", user.email);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userId', user.uid);
      } else {
        console.log("User is signed out");
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userId');
      }
    });
  } else {
    // Retry after a short delay if Firebase services are not ready
    setTimeout(initializeFirebaseAuth, 100);
  }
}

// Initialize when the script loads
initializeFirebaseAuth();

// Function to create a new user account
async function createUserAccount(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User account created successfully:", userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error creating user account:", error);
    return { success: false, error: error.message };
  }
}

// Function to sign in with email and password
async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully:", userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error signing in:", error);
    return { success: false, error: error.message };
  }
}

// Function to sign out the current user
async function signOutUser() {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error: error.message };
  }
}

// Function to change user password
async function changeUserPassword(newPassword) {
  try {
    const user = auth.currentUser;
    if (user) {
      await updatePassword(user, newPassword);
      console.log("Password updated successfully");
      return { success: true };
    } else {
      return { success: false, error: "No user is currently signed in" };
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message };
  }
}

// Function to get current user
function getCurrentUser() {
  return auth.currentUser;
}

// Function to check if user is authenticated
function isUserAuthenticated() {
  return auth.currentUser !== null;
}

// Make functions available globally
window.firebaseAuth = {
  createUserAccount,
  signInUser,
  signOutUser,
  changeUserPassword,
  getCurrentUser,
  isUserAuthenticated
};

