// Firebase Firestore Database Helper Functions

// Global variables for Firebase services (will be available after firebase-config.js loads)
let db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot;

// Initialize Firebase services when available
function initializeFirebaseDB() {
  if (window.firebaseServices) {
    db = window.firebaseServices.db;
    collection = window.firebaseServices.collection;
    addDoc = window.firebaseServices.addDoc;
    getDocs = window.firebaseServices.getDocs;
    doc = window.firebaseServices.doc;
    updateDoc = window.firebaseServices.updateDoc;
    deleteDoc = window.firebaseServices.deleteDoc;
    onSnapshot = window.firebaseServices.onSnapshot;
    
    console.log("Firebase Database services initialized");
  } else {
    // Retry after a short delay if Firebase services are not ready
    setTimeout(initializeFirebaseDB, 100);
  }
}

// Initialize when the script loads
initializeFirebaseDB();

// Collection name for properties/lands data
const PROPERTIES_COLLECTION = 'properties';

// Function to add a new property to Firestore
async function addProperty(propertyData) {
  try {
    const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), {
      ...propertyData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Property added with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding property: ", error);
    return { success: false, error: error.message };
  }
}

// Function to get all properties from Firestore
async function getAllProperties() {
  try {
    const querySnapshot = await getDocs(collection(db, PROPERTIES_COLLECTION));
    const properties = [];
    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log("Retrieved", properties.length, "properties");
    return { success: true, data: properties };
  } catch (error) {
    console.error("Error getting properties: ", error);
    return { success: false, error: error.message };
  }
}

// Function to update a property in Firestore
async function updateProperty(propertyId, updatedData) {
  try {
    const propertyRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    await updateDoc(propertyRef, {
      ...updatedData,
      updatedAt: new Date()
    });
    console.log("Property updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating property: ", error);
    return { success: false, error: error.message };
  }
}

// Function to delete a property from Firestore
async function deleteProperty(propertyId) {
  try {
    await deleteDoc(doc(db, PROPERTIES_COLLECTION, propertyId));
    console.log("Property deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting property: ", error);
    return { success: false, error: error.message };
  }
}

// Function to listen for real-time updates to properties
function listenToPropertiesUpdates(callback) {
  try {
    const unsubscribe = onSnapshot(collection(db, PROPERTIES_COLLECTION), (querySnapshot) => {
      const properties = [];
      querySnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data()
        });
      });
      console.log("Real-time update: Retrieved", properties.length, "properties");
      callback(properties);
    });
    return unsubscribe; // Return the unsubscribe function
  } catch (error) {
    console.error("Error setting up real-time listener: ", error);
    return null;
  }
}

// Function to search properties based on search term
async function searchProperties(searchTerm) {
  try {
    const allPropertiesResult = await getAllProperties();
    if (!allPropertiesResult.success) {
      return allPropertiesResult;
    }
    
    const properties = allPropertiesResult.data;
    const searchTermLower = searchTerm.toLowerCase();
    
    const filteredProperties = properties.filter(prop => {
      return (prop.plotNumber && prop.plotNumber.toLowerCase().includes(searchTermLower)) ||
             (prop.district && prop.district.toLowerCase().includes(searchTermLower)) ||
             (prop.block && prop.block.toLowerCase().includes(searchTermLower)) ||
             (prop.ownerInfo && prop.ownerInfo.toLowerCase().includes(searchTermLower));
    });
    
    console.log("Search found", filteredProperties.length, "matching properties");
    return { success: true, data: filteredProperties };
  } catch (error) {
    console.error("Error searching properties: ", error);
    return { success: false, error: error.message };
  }
}

// Make functions available globally
window.firebaseDB = {
  addProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
  listenToPropertiesUpdates,
  searchProperties
};

