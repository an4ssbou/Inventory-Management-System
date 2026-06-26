import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiClock, FiPackage, FiShield } from 'react-icons/fi';
import CheckingBoxes from '../assets/Checking_boxes.gif';

const Hero = () => {
  const stats = [
    { label: 'Demandes suivies', value: 'Temps réel', icon: FiClock },
    { label: 'Catalogue matériel', value: 'Centralisé', icon: FiPackage },
    { label: 'Accès sécurisé', value: 'Rôles CHU', icon: FiShield },
  ];

  return (
    <main className="page-shell">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-14">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-800">
            <FiCheckCircle /> Portail interne CHU
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
            Pilotez les demandes de matériel avec une vue claire et fiable.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
            Consultez les disponibilités, envoyez une demande de prêt et suivez vos emprunts depuis une interface pensée pour les équipes hospitalières.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/material" className="btn-primary">
              Consulter le matériel <FiArrowRight />
            </Link>
            <Link to="/requests" className="btn-secondary">
              Mes demandes
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="dashboard-card p-4">
                  <Icon className="mb-3 text-xl text-teal-700" />
                  <p className="text-sm font-extrabold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface relative overflow-hidden rounded-xl p-4 sm:p-6">
          <div className="rounded-lg border border-slate-200 bg-slate-950 p-3 shadow-2xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-auto text-xs font-bold text-slate-400">inventory.chu</span>
            </div>
            <div className="rounded-md bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Aperçu</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">Flux matériel</h2>
                </div>
                <span className="status-pill bg-emerald-100 text-emerald-800">Disponible</span>
              </div>
              <div className="mt-5 grid gap-3">
                {['Demande enregistrée', 'Validation responsable', 'Retrait au service IT'].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-700 text-sm font-black text-white">{index + 1}</span>
                    <span className="text-sm font-bold text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
              <img src={CheckingBoxes} alt="Illustration du suivi des demandes de matériel" className="mt-5 max-h-56 w-full rounded-lg object-contain" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Hero;
