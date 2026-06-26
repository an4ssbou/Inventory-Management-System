import { useEffect, useState } from 'react';
import { Modal } from 'flowbite-react';
import { FiFilter, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MaterialCard from './MaterialCard';
import SessionExpired from './SessionExpired';
import Loading from './Loading';
import { api, authHeaders, getErrorMessage, isAuthError } from '../utils/api';
import { clearToken, decodeToken, getToken } from '../utils/auth';

const filters = ['Tous', 'Consommable', 'Non Consommable'];

const MaterialListing = () => {
  const navigate = useNavigate();
  const [material, setMaterial] = useState([]);
  const [utilisateur, setUtilisateur] = useState({});
  const [checkedType, setCheckedType] = useState('Tous');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    const handleRequestError = (error) => {
      const message = getErrorMessage(error);
      if (message === 'Only admins are allowed to access this page') return navigate('/');
      if (isAuthError(error)) { clearToken(); setTokenExpired(true); return; }
      setErrorMessage('Impossible de charger les matériels. Vérifiez la connexion au serveur.');
    };

    const fetchData = async () => {
      const token = getToken();
      const decoded = decodeToken(token);
      if (!token || !decoded?.id) return navigate('/login');
      setLoading(true); setErrorMessage('');
      try {
        const query = checkedType === 'Tous' ? '?status=Disponible' : `?type=${checkedType}&status=Disponible`;
        const [materialsResponse, userResponse] = await Promise.all([
          api.get(`/material${query}`, authHeaders(token)),
          api.get(`/user/${decoded.id}`, authHeaders(token)),
        ]);
        if (!active) return;
        setMaterial(materialsResponse.data?.mats || []);
        setUtilisateur(userResponse.data?.user || {});
      } catch (error) {
        if (active) handleRequestError(error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [checkedType, navigate]);

  if (loading) return <Loading />;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-700">Catalogue</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Matériel disponible</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Filtrez les équipements disponibles et envoyez une demande de prêt en quelques secondes.</p>
          </div>
          <div className="surface flex flex-wrap gap-2 rounded-xl p-2">
            {filters.map((filter) => (
              <button key={filter} type="button" onClick={() => setCheckedType(filter)} className={`rounded-lg px-3 py-2 text-sm font-extrabold transition ${checkedType === filter ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{errorMessage}</div>
        ) : material.length === 0 ? (
          <div className="surface rounded-xl p-10 text-center">
            <FiPackage className="mx-auto mb-4 text-5xl text-slate-300" />
            <h2 className="text-xl font-black text-slate-950">Aucun matériel disponible</h2>
            <p className="mt-2 text-sm text-slate-500">Essayez un autre filtre ou revenez plus tard.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {material.map((mat) => <MaterialCard key={mat._id} user={utilisateur} mat={mat} />)}
          </div>
        )}
      </div>
      <Modal show={tokenExpired} size="md" onClose={() => { setTokenExpired(false); navigate('/login'); }} popup>
        <Modal.Header />
        <Modal.Body><SessionExpired /></Modal.Body>
      </Modal>
    </main>
  );
};

export default MaterialListing;
