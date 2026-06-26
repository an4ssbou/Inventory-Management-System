import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import moment from 'moment';

const LoanMng = ({ loan = null, onLoanChange }) => {
    const navigate = useNavigate();
    const [utilisateur, setUtilisateur] = useState(loan ? loan.utilisateur._id : '');
    const [material, setMaterial] = useState(loan ? loan.matériel._id : '');
    const [prise, setPrise] = useState(loan ? loan.prise : '');
    const [retour, setRetour] = useState(loan ? loan.retour : '');
    const [users, setUsers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [errors, setErrors] = useState({});
    const token = localStorage.getItem("token")

    const getUsers = async () => {
        try {
            const res = await axios.get("http://localhost:4000/api/users",{
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
            setUsers(res.data.users);
        } catch (error) {
            console.log(error);
            if (error.response.data.message === 'Only admins are allowed to access this page') {
                navigate('/');
              }else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Ivalid Token format" || error.response.data.message === "Forbidden: Ivalid Token"){
                localStorage.removeItem("token");
                navigate('/login')
              }
        }
    };

    const getMaterials = async () => {
        try {
            const res = await axios.get("http://localhost:4000/api/material?status=Disponible",{
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
            setMaterials(res.data.mats);
        } catch (error) {
            console.log(error);
            if (error.response.data.message === 'Only admins are allowed to access this page') {
                navigate('/');
            }else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Ivalid Token format" || error.response.data.message === "Forbidden: Ivalid Token"){
                localStorage.removeItem("token");
                navigate('/login')
              }
        }
    };

    useEffect(() => {
        if (loan) {
            setUtilisateur(loan.utilisateur._id || '');
            setMaterial(loan.matériel._id || '');
            setPrise(loan.prise || '');
            setRetour(loan.retour || '');
        } else {
            setUtilisateur('');
            setMaterial('');
            setPrise('');
            setRetour('');
        }
        getUsers();
        getMaterials();
    }, [loan]);

    const validate = () => {
        const newErrors = {};
        const currentDate = moment().startOf('day');

        if (!utilisateur) newErrors.utilisateur = "Utilisateur est requis";
        if (!material) newErrors.material = "Matériel est requis";
        if (!prise) {
            newErrors.prise = "Date de prise est requise";
        } else {
            const priseDate = moment(prise);
            if (!priseDate.isValid()) {
                newErrors.prise = "Date de prise n'est pas valide";
            } else if (priseDate.isBefore(currentDate)) {
                newErrors.prise = "Date de prise doit être avant la date actuelle";
            } else if (retour && priseDate.isAfter(moment(retour))) {
                newErrors.prise = "Date de prise doit être avant la date de retour";
            }
        }
        if (!retour) {
            newErrors.retour = "Date de retour est requise";
        } else {
            const retourDate = moment(retour);
            if (!retourDate.isValid()) {
                newErrors.retour = "Date de retour n'est pas valide";
            } else if (prise && retourDate.isBefore(moment(prise))) {
                newErrors.retour = "Date de retour doit être après la date de prise";
            }
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const requestData = {
            utilisateur,
            matériel: material,
            prise,
            retour
        };

        try {
            if (loan) {
                await axios.put(`http://localhost:4000/api/request/${loan._id}`, requestData,{
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
            } else {
                await axios.post("http://localhost:4000/api/request", requestData,{
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
            }
            onLoanChange();
        } catch (error) {
            console.log(error);
            if (error.response.data.message === 'Only admins are allowed to access this page') {
                navigate('/');
              }else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Ivalid Token format" || error.response.data.message === "Forbidden: Ivalid Token"){
                localStorage.removeItem("token");
                navigate('/login')
              }
        } finally {
            setUtilisateur('');
            setMaterial('');
            setPrise('');
            setRetour('');
            setErrors({});
        }
    };

    return (
        <>
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {loan != null ? "Editer Demande" : "Ajouter Demande"}
                </h3>
            </div>

            <div className="gap-4 mb-4 sm:grid-cols-2">
                <label htmlFor="utilisateur" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Utilisateur</label>
                <select
                    id="utilisateur"
                    value={utilisateur}
                    onChange={(e) => setUtilisateur(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                >
                    <option>Selectionner Utilisateur</option>
                    {users.map((user) => (
                        <option key={user._id} value={user._id}>{user.nom + ' ' + user.prénom}</option>
                    ))}
                </select>
                {errors.utilisateur && <p className="text-red-500 text-sm">{errors.utilisateur}</p>}

                <label htmlFor="matériel" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Matériel</label>
                <select
                    id="matériel"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                >
                    <option>Selectionner Matériel</option>
                    {materials.map((mat) => (
                        <option key={mat._id} value={mat._id}>{mat.designation}</option>
                    ))}
                </select>
                {errors.material && <p className="text-red-500 text-sm">{errors.material}</p>}

                <div>
                    <label htmlFor="prise" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Date de prise</label>
                    <input
                        type="date"
                        name="prise"
                        id="prise"
                        value={moment(prise).format("YYYY-MM-DD")}
                        onChange={(e) => setPrise(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                        required=""
                    />
                    {errors.prise && <p className="text-red-500 text-sm">{errors.prise}</p>}
                </div>

                <div>
                    <label htmlFor="retour" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Date de retour</label>
                    <input
                        type="date"
                        name="retour"
                        id="retour"
                        value={moment(retour).format("YYYY-MM-DD")}
                        onChange={(e) => setRetour(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                        required=""
                    />
                    {errors.retour && <p className="text-red-500 text-sm">{errors.retour}</p>}
                </div>
            </div>

            <button onClick={handleSubmit} type="submit" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                {loan ? "Modifier" : "Ajouter"}
            </button>
        </>
    );
};

export default LoanMng;
