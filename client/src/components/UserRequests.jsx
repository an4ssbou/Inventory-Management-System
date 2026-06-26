import { useEffect, useState } from 'react';
import { Modal } from 'flowbite-react';
import { FiCalendar, FiClipboard, FiFilter, FiPackage } from 'react-icons/fi';
import { MdPendingActions } from 'react-icons/md';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Loading from './Loading';
import SessionExpired from './SessionExpired';
import { api, authHeaders, getErrorMessage, isAuthError } from '../utils/api';
import { clearToken, decodeToken, getToken } from '../utils/auth';

const filters = ['Tous', 'En Attente', 'Validée', 'Refusée'];

const statusStyles = {
  Refusée: 'bg-red-50 text-red-700 ring-red-200',
  'En Attente': 'bg-amber-50 text-amber-800 ring-amber-200',
  Validée: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const UserRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkedType, setCheckedType] = useState('Tous');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const handleRequestError = (error) => {
      const message = getErrorMessage(error);
      if (message === 'Only admins are allowed to access this page') {
        navigate('/');
        return;
      }

      if (isAuthError(error)) {
        clearToken();
        setTokenExpired(true);
        return;
      }

      setErrorMessage('Impossible de charger vos demandes. Vérifiez la connexion au serveur.');
    };

    const fetchData = async () => {
      const token = getToken();
      const decoded = decodeToken(token);
      if (!token || !decoded?.id) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const userResponse = await api.get(`/user/${decoded.id}`, authHeaders(token));
        const currentUser = userResponse.data?.user;
        const statusQuery = checkedType === 'Tous' ? '' : `?status=${checkedType}`;
        const requestsResponse = await api.get(`/requests/${currentUser._id}${statusQuery}`, authHeaders(token));

        if (!active) return;
        setUser(currentUser);
        setRequests(requestsResponse.data?.requests || []);
      } catch (error) {
        if (active) handleRequestError(error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [checkedType, navigate]);

  if (loading) return <Loading />;

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-700">Suivi utilisateur</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Mes demandes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Consultez le statut de vos demandes de prêt et les dates de prise ou retour prévues.
            </p>
          </div>

          <div className="surface flex flex-wrap items-center gap-2 rounded-xl p-2">
            <FiFilter className="ml-1 hidden text-slate-400 sm:block" />
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCheckedType(filter)}
                className={`rounded-lg px-3 py-2 text-sm font-extrabold transition ${
                  checkedType === filter ? 'bg-teal-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : requests.length === 0 ? (
          <div className="surface rounded-xl p-10 text-center">
            <FiClipboard className="mx-auto mb-4 text-5xl text-slate-300" />
            <h2 className="text-xl font-black text-slate-950">Aucune demande trouvée</h2>
            <p className="mt-2 text-sm text-slate-500">
              {user?.nom ? `${user.nom}, aucune demande ne correspond au filtre actuel.` : 'Aucune demande ne correspond au filtre actuel.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <article key={request._id} className="dashboard-card p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${statusStyles[request.status] || 'bg-slate-50 text-slate-700 ring-slate-200'}`}>
                        {request.status === 'En Attente' && <MdPendingActions />}
                        {request.status || 'Non renseigné'}
                      </span>
                      <span className="break-all text-xs font-bold text-slate-400">ID: {request._id}</span>
                    </div>
                    <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                      <FiPackage className="shrink-0 text-teal-700" />
                      <span className="min-w-0 truncate">{request.matériel?.designation || 'Matériel non renseigné'}</span>
                    </h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[390px]">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        <FiCalendar /> Prise
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-900">{moment(request.prise).format('DD-MM-YYYY')}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        <FiCalendar /> Retour
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-900">
                        {request.retour ? moment(request.retour).format('DD-MM-YYYY') : 'Non défini'}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
      <Modal show={tokenExpired} size="md" onClose={() => { setTokenExpired(false); navigate('/login'); }} popup>
        <Modal.Header />
        <Modal.Body>
          <SessionExpired />
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default UserRequests;
