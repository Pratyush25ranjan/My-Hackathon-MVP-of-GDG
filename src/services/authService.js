// // src/services/authService.js - UPDATED WITH VERIFICATION IMAGE
// // REPLACE YOUR EXISTING authService.js WITH THIS

// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   updateProfile,
//   sendPasswordResetEmail,
//   updatePassword,
// } from "firebase/auth";
// import { doc, setDoc, getDoc } from "firebase/firestore";
// import { auth, db, googleProvider } from "./firebase";
// import { validateEmailComprehensive } from "../utils/emailValidator";
// import { sendAdminNotification } from "../utils/email";

// /**
//  * Sign up with email and password
//  * @param {string} email - User email
//  * @param {string} password - User password
//  * @param {string} firstName - First name
//  * @param {string} lastName - Last name
//  * @param {string} department - Department
//  * @param {number} year - Year of study
//  * @param {string} verificationImageBase64 - Base64 encoded identity proof image (REQUIRED)
//  * @returns {object} - { user, error }
//  */
// export async function signUpWithEmail(
//   email,
//   password,
//   firstName,
//   lastName,
//   department,
//   year,
//   verificationImageBase64
// ) {
//   try {
//     // Validate email
//     const emailValidation = validateEmailComprehensive(email);
//     if (!emailValidation.isValid) {
//       return { user: null, error: emailValidation.message };
//     }

//     // Validate password (min 6 characters)
//     if (!password || password.length < 6) {
//       return { user: null, error: "Password must be at least 6 characters" };
//     }

//     // Validate identity proof image
//     if (!verificationImageBase64) {
//       return { user: null, error: "Proof of Identity is required" };
//     }

//     // Create Firebase auth user
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     const firebaseUser = userCredential.user;

//     // Update Firebase profile with display name
//     await updateProfile(firebaseUser, {
//       displayName: `${firstName} ${lastName}`,
//     });

//     // Create Firestore user document with verification image
  
//     await setDoc(doc(db, "users", firebaseUser.uid), {
//   email: firebaseUser.email,
//   firstName,
//   lastName,
//   department: department.toLowerCase(),
//   year: parseInt(year),
//   signupMethod: "email",
//   emailVerified: true,
//   emailVerifiedAt: new Date(),
//   status: "pending",
//   verified: false,
//   blocked: false,
//   createdAt: new Date(),
//   profileImageBase64: null,
//   verificationImageBase64,
//   role: "student",
// });

// // 📧 Notify admin via EmailJS (NON-BLOCKING)
// sendAdminNotification({
//   name: `${firstName} ${lastName}`,
//   email: firebaseUser.email,
//   department: department.toLowerCase(),
//   year: parseInt(year),
// }).catch((err) => {
//   console.error("Admin email notification failed:", err);
// });

// console.log("✅ Student registered & admin notified via EmailJS");

// return { user: firebaseUser, error: null };

//   } catch (error) {
//     console.error("Sign up error:", error);
//     return { user: null, error: error.message };
//   }
// }

// /**
//  * Sign up with Google
//  * @param {string} firstName - First name
//  * @param {string} lastName - Last name
//  * @param {string} department - Department
//  * @param {number} year - Year of study
//  * @param {string} verificationImageBase64 - Base64 encoded identity proof image (REQUIRED)
//  * @returns {object} - { user, error }
//  */
// export async function signUpWithGoogle(
//   firstName,
//   lastName,
//   department,
//   year,
//   verificationImageBase64
// ) {
//   try {
//     // Validate identity proof image
//     if (!verificationImageBase64) {
//       return { user: null, error: "Proof of Identity is required" };
//     }

//     // Sign in with Google popup
//     const result = await signInWithPopup(auth, googleProvider);
//     const firebaseUser = result.user;

//     // Check if user already exists in Firestore
//     const userDocRef = doc(db, "users", firebaseUser.uid);
//     const userDocSnap = await getDoc(userDocRef);

//     if (userDocSnap.exists()) {
//       // User already exists, just return
//       return { user: firebaseUser, error: null };
//     }

//     // Create new Firestore user document with verification image
//     // This will trigger the onStudentSignup Cloud Function
//     // which will send admin notification email
//     await setDoc(userDocRef, {
//   email: firebaseUser.email,
//   firstName: firstName || firebaseUser.displayName?.split(" ")[0] || "",
//   lastName: lastName || firebaseUser.displayName?.split(" ")[1] || "",
//   department: department.toLowerCase(),
//   year: parseInt(year),
//   signupMethod: "google",
//   emailVerified: true,
//   emailVerifiedAt: new Date(),
//     status: "pending",
//   verified: false,
//   blocked: false,
//   createdAt: new Date(),
//   profileImageBase64: firebaseUser.photoURL || null,
//   verificationImageBase64,
//   role: "student",
// });

// // 📧 Notify admin via EmailJS (NON-BLOCKING)
// sendAdminNotification({
//   name: `${firstName} ${lastName}`.trim() || firebaseUser.displayName || "New Student",
//   email: firebaseUser.email,
//   department: department.toLowerCase(),
//   year: parseInt(year),
// }).catch((err) => {
//   console.error("Admin email notification failed:", err);
// });

// console.log("✅ Google signup & admin notified via EmailJS");

// return { user: firebaseUser, error: null };

//   } catch (error) {
//     console.error("Google sign up error:", error);
//     return { user: null, error: error.message };
//   }
// }

// /**
//  * Login with email and password
//  * @param {string} email - User email
//  * @param {string} password - User password
//  * @returns {object} - { user, error }
//  */
// export async function loginWithEmail(email, password) {
//   try {
//     const emailValidation = validateEmailComprehensive(email);
//     if (!emailValidation.isValid) {
//       return { user: null, error: emailValidation.message };
//     }

//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     return { user: userCredential.user, error: null };
//   } catch (error) {
//     console.error("Login error:", error);
    
//     // Provide user-friendly error messages
//     if (error.code === "auth/user-not-found") {
//       return { user: null, error: "Email not found. Please sign up first." };
//     } else if (error.code === "auth/wrong-password") {
//       return { user: null, error: "Incorrect password" };
//     } else if (error.code === "auth/invalid-email") {
//       return { user: null, error: "Invalid email format" };
//     }
    
//     return { user: null, error: error.message };
//   }
// }

// /**
//  * Login with Google
//  * @returns {object} - { user, error }
//  */
// export async function loginWithGoogle() {
//   try {
//     const result = await signInWithPopup(auth, googleProvider);
//     return { user: result.user, error: null };
//   } catch (error) {
//     console.error("Google login error:", error);
//     return { user: null, error: error.message };
//   }
// }

// /**
//  * Send password reset email
//  * @param {string} email - User email
//  * @returns {object} - { success: boolean, message: string }
//  */
// export async function resetPassword(email) {
//   try {
//     const emailValidation = validateEmailComprehensive(email);
//     if (!emailValidation.isValid) {
//       return { success: false, message: emailValidation.message };
//     }

//     await sendPasswordResetEmail(auth, email);
//     return {
//       success: true,
//       message: "Password reset email sent. Check your inbox.",
//     };
//   } catch (error) {
//     console.error("Reset password error:", error);
    
//     if (error.code === "auth/user-not-found") {
//       return {
//         success: false,
//         message: "No account found with this email",
//       };
//     }
    
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Change password for logged-in user
//  * @param {string} newPassword - New password
//  * @returns {object} - { success: boolean, message: string }
//  */
// export async function changePassword(newPassword) {
//   try {
//     const user = auth.currentUser;

//     if (!user) {
//       return { success: false, message: "No user logged in" };
//     }

//     if (!newPassword || newPassword.length < 6) {
//       return {
//         success: false,
//         message: "Password must be at least 6 characters",
//       };
//     }

//     await updatePassword(user, newPassword);
//     return { success: true, message: "Password changed successfully" };
//   } catch (error) {
//     console.error("Change password error:", error);
    
//     if (error.code === "auth/weak-password") {
//       return { success: false, message: "Password is too weak" };
//     }
    
//     return { success: false, message: error.message };
//   }
// }

// /**
//  * Get current user from Firestore
//  * @returns {Promise<object|null>} - User document or null
//  */
// export async function getCurrentUserFromFirestore() {
//   try {
//     const user = auth.currentUser;
//     if (!user) return null;

//     const userDocRef = doc(db, "users", user.uid);
//     const userDocSnap = await getDoc(userDocRef);

//     return userDocSnap.exists() ? userDocSnap.data() : null;
//   } catch (error) {
//     console.error("Get current user error:", error);
//     return null;
//   }
// }

// /**
//  * Call admin decision function (approve/reject student)
//  * @param {string} userId - Student user ID
//  * @param {string} action - "approve" or "reject"
//  * @param {string} rejectionReason - Reason if rejecting (optional)
//  * @returns {Promise<object>} - Result of admin decision
//  */

// /*
// ⚠️ DISABLED: Cloud Functions not available on Spark plan

// This function was intended to call a Firebase Cloud Function
// for admin approve/reject actions.

// Because the project is running on the Spark (free) plan
// without Blaze billing, Cloud Functions cannot be deployed.

// Admin approval/rejection is instead handled directly
// from the Admin Dashboard by updating Firestore documents.

// This approach is valid for hackathon / prototype usage.
// */

// // export async function callAdminDecision(userId, action, rejectionReason = null) {
// //   try {
// //     // Import Cloud Functions
// //     const { getFunctions, httpsCallable } = await import("firebase/functions");
// //     const functions = getFunctions();
// //     const onAdminDecision = httpsCallable(functions, "onAdminDecision");

// //     const result = await onAdminDecision({
// //       userId,
// //       action,
// //       rejectionReason,
// //     });

// //     return { success: true, message: result.data.message };
// //   } catch (error) {
// //     console.error("Admin decision error:", error);
// //     return { success: false, message: error.message };
// //   }
// // }





// src/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db, googleProvider } from "./firebase";
import { validateEmailComprehensive } from "../utils/emailValidator";
import { sendAdminNotification } from "../utils/email";

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email,
  password,
  firstName,
  lastName,
  department,
  year,
  verificationImageBase64
) {
  try {
    const emailValidation = validateEmailComprehensive(email);
    if (!emailValidation.isValid) {
      return { user: null, error: emailValidation.message };
    }

    if (!password || password.length < 6) {
      return { user: null, error: "Password must be at least 6 characters" };
    }

    if (!verificationImageBase64) {
      return { user: null, error: "Proof of Identity is required" };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, {
      displayName: `${firstName} ${lastName}`,
    });

    // ✅ WRITE TO pendingStudents
    await setDoc(doc(db, "pendingStudents", firebaseUser.uid), {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      firstName,
      lastName,
      department: department.toLowerCase(),
      year: parseInt(year),
      signupMethod: "email",
      status: "pending",
      verified: false,
      blocked: false,
      role: "student",
      profileImageBase64: null,
      verificationImageBase64,
      createdAt: serverTimestamp(),
    });

    // 📧 Admin email (non-blocking)
    sendAdminNotification({
      name: `${firstName} ${lastName}`,
      email: firebaseUser.email,
      department: department.toLowerCase(),
      year: parseInt(year),
    }).catch(console.error);

    return { user: firebaseUser, error: null };
  } catch (error) {
    console.error("Sign up error:", error);
    return { user: null, error: error.message };
  }
}

/**
 * Sign up with Google
 */
export async function signUpWithGoogle(
  firstName,
  lastName,
  department,
  year,
  verificationImageBase64
) {
  try {
    if (!verificationImageBase64) {
      return { user: null, error: "Proof of Identity is required" };
    }

    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const pendingRef = doc(db, "pendingStudents", firebaseUser.uid);
    const pendingSnap = await getDoc(pendingRef);

    if (pendingSnap.exists()) {
      return { user: firebaseUser, error: null };
    }

    await setDoc(pendingRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      firstName:
        firstName || firebaseUser.displayName?.split(" ")[0] || "",
      lastName:
        lastName || firebaseUser.displayName?.split(" ")[1] || "",
      department: department.toLowerCase(),
      year: parseInt(year),
      signupMethod: "google",
      status: "pending",
      verified: false,
      blocked: false,
      role: "student",
      profileImageBase64: firebaseUser.photoURL || null,
      verificationImageBase64,
      createdAt: serverTimestamp(),
    });

    sendAdminNotification({
      name:
        `${firstName} ${lastName}`.trim() ||
        firebaseUser.displayName ||
        "New Student",
      email: firebaseUser.email,
      department: department.toLowerCase(),
      year: parseInt(year),
    }).catch(console.error);

    return { user: firebaseUser, error: null };
  } catch (error) {
    console.error("Google sign up error:", error);
    return { user: null, error: error.message };
  }
}

/**
 * Login with email
 */
export async function loginWithEmail(email, password) {
  try {
    const emailValidation = validateEmailComprehensive(email);
    if (!emailValidation.isValid) {
      return { user: null, error: emailValidation.message };
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return { user: userCredential.user, error: null };
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return { user: null, error: "Email not found. Please sign up first." };
    }
    if (error.code === "auth/wrong-password") {
      return { user: null, error: "Incorrect password" };
    }
    return { user: null, error: error.message };
  }
}

/**
 * Login with Google
 */
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}


/**
 * Reset password
 */
export async function resetPassword(email) {
  try {
    const emailValidation = validateEmailComprehensive(email);
    if (!emailValidation.isValid) {
      return { success: false, message: emailValidation.message };
    }

    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent." };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Change password
 */
export async function changePassword(newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, message: "No user logged in" };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: "Password must be at least 6 characters" };
    }

    await updatePassword(user, newPassword);
    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Get current user from Firestore
 */
export async function getCurrentUserFromFirestore() {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    // 🔴 check pending students first
    const pendingRef = doc(db, "pendingStudents", user.uid);
    const pendingSnap = await getDoc(pendingRef);
    if (pendingSnap.exists()) return pendingSnap.data();

    // then approved users
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return userSnap.data();

    return null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
