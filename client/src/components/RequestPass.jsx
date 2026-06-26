import { useState } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { api, authHeaders, getErrorMessage, isAuthError } from '../utils/api';
import { clearToken, getToken } from '../utils/auth';

const RequestPass = ({ user, mat, onRequestSubmit }) => {
  const navigate = useNavigate();
  const [prise, setPrise] = useState('');
  const [retour, setRetour] = useState('');
  const [errors, setErrors] = useState({});
  const token = getToken();
  const needsReturnDate = mat?.type === 'Non Consommable';

  const validate = () => {
    const newErrors = {};
    const currentDate = moment().startOf('day');

    if (!user?._id) newErrors.utilisateur = 'Utilisateur est requis';
    if (!mat?._id) newErrors.mat = 'Matériel est requis';

    if (!prise) {
      newErrors.prise = 'Date de prise est requise';
    } else {
      const priseDate = moment(prise);
      if (!priseDate.isValid()) {
        newErrors.prise = "Date de prise n'est pas valide";
      } else if (priseDate.isBefore(currentDate)) {
        newErrors.prise = 'Date de prise doit être égale ou postérieure à la date actuelle';
      } else if (retour && priseDate.isAfter(moment(retour))) {
        newErrors.prise = 'Date de prise doit être avant la date de retour';
      }
    }

    if (needsReturnDate && !retour) {
      newErrors.retour = 'Date de retour est requise';
    } else if (retour) {
      const retourDate = moment(retour);
      if (!retourDate.isValid()) {
        newErrors.retour = "Date de retour n'est pas valide";
      } else if (prise && retourDate.isBefore(moment(prise))) {
        newErrors.retour = 'Date de retour doit être après la date de prise';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const requestData = {
      utilisateur: user._id,
      matériel: mat._id,
      prise,
      retour: needsReturnDate ? retour : null,
    };

    try {
      await api.post('/request', requestData, authHeaders(token));
      onRequestSubmit();
    } catch (error) {
      const message = getErrorMessage(error);
      if (message === 'Only admins are allowed to access this page') {
        navigate('/');
      } else if (isAuthError(error)) {
        clearToken();
        navigate('/login');
      } else {
        setErrors({ submit: 'Impossible d’envoyer la demande. Vérifiez la connexion au serveur.' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center justify-between rounded-t border-b pb-4 dark:border-gray-600 sm:mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Faire Une Demande</h3>
      </div>

      <div className="mb-4 gap-4 sm:grid-cols-2">
        <label htmlFor="utilisateur" className="mb-2 mt-3 block text-sm font-medium text-gray-900 dark:text-white">Utilisateur</label>
        <select id="utilisateur" value={user?._id || ''} className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" disabled>
          <option>{user ? `${user.nom} ${user.prénom}` : 'Utilisateur non chargé'}</option>
        </select>
        {errors.utilisateur && <p className="text-sm text-red-500">{errors.utilisateur}</p>}

        <label htmlFor="materiel" className="mb-2 mt-3 block text-sm font-medium text-gray-900 dark:text-white">Matériel</label>
        <select id="materiel" value={mat?._id || ''} className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" disabled>
          <option value={mat?._id || ''}>{mat?.designation || 'Matériel non chargé'}</option>
        </select>
        {errors.mat && <p className="text-sm text-red-500">{errors.mat}</p>}

        <div>
          <label htmlFor="prise" className="mb-2 mt-3 block text-sm font-medium text-gray-900 dark:text-white">Date de prise</label>
          <input type="date" name="prise" id="prise" value={prise} onChange={(event) => setPrise(event.target.value)} className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required />
          {errors.prise && <p className="text-sm text-red-500">{errors.prise}</p>}
        </div>

        {needsReturnDate && (
          <div>
            <label htmlFor="retour" className="mb-2 mt-3 block text-sm font-medium text-gray-900 dark:text-white">Date de retour</label>
            <input type="date" name="retour" id="retour" value={retour} onChange={(event) => setRetour(event.target.value)} className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required />
            {errors.retour && <p className="text-sm text-red-500">{errors.retour}</p>}
          </div>
        )}
      </div>

      {errors.submit && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">{errors.submit}</p>}

      <button type="submit" className="inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
        Demander
      </button>
    </form>
  );
};

export default RequestPass;
