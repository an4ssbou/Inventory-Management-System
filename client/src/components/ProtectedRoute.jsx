import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api, authHeaders } from '../utils/api';
import { clearToken, decodeToken, getToken } from '../utils/auth';
import Loading from './Loading';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    const token = getToken();
    const decoded = decodeToken(token);

    if (!token || !decoded?.id) {
      setStatus('unauthenticated');
      return undefined;
    }

    if (!requireAdmin) {
      setStatus('allowed');
      return undefined;
    }

    const validateAdmin = async () => {
      try {
        const response = await api.get(`/user/${decoded.id}`, authHeaders(token));
        if (!active) return;

        if (response.data?.user?.Role === 'Admin') {
          setStatus('allowed');
        } else {
          setStatus('forbidden');
        }
      } catch {
        if (!active) return;
        setMessage('Impossible de vérifier votre accès administrateur. Vérifiez la connexion au serveur.');
        setStatus('error');
      }
    };

    validateAdmin();

    return () => {
      active = false;
    };
  }, [requireAdmin]);

  if (status === 'checking') return <Loading />;

  if (status === 'unauthenticated') {
    clearToken();
    return <Navigate to="/login" replace />;
  }

  if (status === 'forbidden') {
    return <Navigate to="/" replace />;
  }

  if (status === 'error') {
    return (
      <section className="min-h-[calc(100vh-62px)] bg-gray-50 px-4 py-10 text-center dark:bg-gray-900">
        <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Accès indisponible</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
      </section>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
