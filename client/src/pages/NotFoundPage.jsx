import { Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const NotFoundPage = () => (
  <section className="page-shell flex items-center justify-center px-4 py-12 text-center">
    <div className="surface max-w-xl rounded-xl p-8">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-amber-100 text-3xl text-amber-700">
        <FiAlertTriangle />
      </div>
      <h1 className="text-4xl font-black text-slate-950 sm:text-5xl">Page introuvable</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">La page demandée n’existe pas ou a été déplacée.</p>
      <Link to="/" className="btn-primary mt-7">
        <FiArrowLeft /> Retour à l’accueil
      </Link>
    </div>
  </section>
);

export default NotFoundPage;
