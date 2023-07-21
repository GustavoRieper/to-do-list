import { useContext } from 'react';
import { AuthGoogleContext } from '../../contexts/authGoogle';
import { Navigate } from 'react-router-dom';
import { GoogleLogo } from "@phosphor-icons/react";
import './style.scss';

export const Login = () => {
  const { signInGoogle, signed } = useContext(AuthGoogleContext);

  async function handleLoginFromGoogle() {
    await signInGoogle();
  }

  if (!signed) {
    return (
      <div className="container">
        <h1>To Do List</h1>
        <span>Organizando suas tarefas</span>

        <button className='button' onClick={() => handleLoginFromGoogle()}>
          <GoogleLogo />Entrar com o Google
        </button>
      </div>
    );
  } else {
    return <Navigate to="/home" />;
  }
};
