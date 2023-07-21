import { createContext, useEffect, useState } from "react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { app } from "../services/firebaseConfig";
import { Navigate } from "react-router-dom";

const provider = new GoogleAuthProvider();

export const AuthGoogleContext = createContext({});

export const AuthGoogleProvider = ({ children }) => {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const firestore = getFirestore(app);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadStorageAuth = () => {
      const sessionToken = sessionStorage.getItem("@AuthFirebase:token");
      const sessionUser = sessionStorage.getItem("@AuthFirebase:user");

      if (sessionToken && sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    };

    loadStorageAuth();
    getUsersFromFirestore();
  }, []);

  // Função para obter os usuários do Firestore e atualizar o estado users
  const getUsersFromFirestore = async () => {
    const usersCollectionRef = collection(firestore, "users");
    const snapshot = await getDocs(usersCollectionRef);
    const userList = snapshot.docs.map((doc) => doc.data());
    setUsers(userList);
  };

  const signInGoogle = async () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        setUser(user);
        sessionStorage.setItem("@AuthFirebase:token", token);
        sessionStorage.setItem("@AuthFirebase:user", JSON.stringify(user));

        // Verificar se o usuário já existe no Firestore
        const userRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          // Se o usuário não existir no Firestore, crie um novo documento
          await setDoc(userRef, {
            email: user.email,
            name: user.displayName,
            photo: user.photoURL,
          });

          // Atualiza a lista com o usuário registrado
          setUsers((prevUsers) => [
            ...prevUsers,
            {
              email: user.email,
              name: user.displayName,
              photo: user.photoURL,
            },
          ]);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };

  function signOut() {
    sessionStorage.clear();
    setUser(null);
    return <Navigate to="/" />;
  }

  return (
    <AuthGoogleContext.Provider
      value={{
        signed: !!user,
        user,
        users,
        signInGoogle,
        signOut,
      }}
    >
      {children}
    </AuthGoogleContext.Provider>
  );
};
