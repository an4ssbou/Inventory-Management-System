import { useState } from 'react';
import { Button, Modal } from 'flowbite-react';
import { FiArrowUpRight, FiPackage } from 'react-icons/fi';
import { GiConfirmed } from 'react-icons/gi';
import RequestPass from './RequestPass';
import { assetUrl } from '../utils/api';

const MaterialCard = ({ user, mat }) => {
  const [openModal, setOpenModal] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleRequestSubmit = () => {
    setOpenModal(false);
    setOpenConfirm(true);
  };

  return (
    <>
      <article className="group dashboard-card overflow-hidden text-left transition hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-44 overflow-hidden bg-slate-100">
          {mat.imageUrl ? (
            <img src={assetUrl(mat.imageUrl)} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" alt={mat.designation || 'Matériel'} />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-slate-300"><FiPackage /></div>
          )}
          <span className="absolute left-3 top-3 status-pill bg-white/92 text-teal-800 shadow-sm">{mat.status || 'Disponible'}</span>
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{mat.type || 'Matériel'}</p>
              <h2 className="mt-1 line-clamp-2 text-lg font-black text-slate-950">{mat.designation}</h2>
            </div>
          </div>
          <button type="button" onClick={() => setOpenModal(true)} className="btn-primary w-full text-sm">
            Demander <FiArrowUpRight />
          </button>
        </div>
      </article>

      <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <RequestPass user={user} mat={mat} onRequestSubmit={handleRequestSubmit} />
        </Modal.Body>
      </Modal>

      <Modal show={openConfirm} size="md" onClose={() => setOpenConfirm(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <GiConfirmed className="mx-auto mb-4 h-14 w-14 text-green-700" />
            <h3 className="mb-5 text-lg font-bold text-slate-700">Votre demande est envoyée avec succès</h3>
            <Button color="success" onClick={() => setOpenConfirm(false)}>D’accord</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MaterialCard;
