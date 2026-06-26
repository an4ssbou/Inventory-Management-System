import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';
import Logo from '../assets/CHU-Logo.png';
import Pic from '../assets/Login-Img.png';
import { api } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.token);
      toast.success('Utilisateur connecté avec succès', { position: 'bottom-right', autoClose: 4000, theme: 'light' });
      navigate('/');
    } catch {
      setErrorMessage('Email ou mot de passe non valide.');
      toast.error('Email ou mot de passe non valide', { position: 'bottom-right', autoClose: 4000, theme: 'light' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell grid min-h-[calc(100vh-68px)] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <img src={Pic} alt="Connexion au système de gestion d'inventaire" className="absolute inset-0 h-full w-full object-cover opacity-42" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/78 to-teal-950/68" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-lg"><img src={Logo} alt="Logo CHU" className="h-8 w-8" /></span>
            <div>
              <p className="text-lg font-black">CHU Inventory</p>
              <p className="text-sm text-slate-300">Accès personnel sécurisé</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-teal-100"><FiShield /> Espace interne</p>
            <h1 className="text-5xl font-black leading-tight">Une entrée unique pour gérer le matériel du service.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-200">Connectez-vous pour consulter les disponibilités, suivre les demandes et accéder aux outils d’administration selon votre rôle.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm"><img src={Logo} alt="Logo CHU" className="h-7 w-7" /></span>
            <div>
              <p className="font-black text-slate-950">CHU Inventory</p>
              <p className="text-sm text-slate-500">Portail matériel</p>
            </div>
          </div>

          <div className="surface rounded-xl p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-700">Connexion</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Bienvenue</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Utilisez vos identifiants internes pour accéder au portail.</p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} name="email" id="email" autoComplete="email" className="field-control pl-10" placeholder="name@company.com" required />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">Mot de passe</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} name="password" id="password" autoComplete="current-password" placeholder="••••••••" className="field-control pl-10" required />
                </div>
              </div>
              {errorMessage && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{errorMessage}</p>}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      </section>
    </main>
  );
};

export default Login;
