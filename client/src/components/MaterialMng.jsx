import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

const MaterialMng = ({ mat = null, onMaterialChange }) => {
    const navigate = useNavigate();
    const [designation, setDesignation] = useState(mat ? mat.designation : '');
    const [type, setType] = useState(mat ? mat.type : '');
    const [status, setStatus] = useState(mat ? mat.status : 'Disponible');
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (mat) {
            setDesignation(mat.designation || '');
            setType(mat.type || '');
            setStatus(mat.status || 'Disponible');
        } else {
            setDesignation('');
            setType('');
            setStatus('Disponible');
        }
    }, [mat]);

    const validate = () => {
        const newErrors = {};

        if (!designation) {
            newErrors.designation = "La designation est requise";
        }
        if (!type) {
            newErrors.type = "Le type est requis";
        }
        if (!status) {
            newErrors.status = "Le statut est requis";
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

        const formData = new FormData();
        formData.append('designation', designation);
        formData.append('type', type);
        formData.append('status', status);
        if (image) {
            formData.append('image', image);
        }

        try {
            if (mat) {
                await axios.put(`${API_BASE_URL}/api/material/${mat._id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${API_BASE_URL}/api/material`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            onMaterialChange();
        } catch (error) {
            console.log(error);
            if (error.response.data.message === 'Only admins are allowed to access this page') {
                navigate('/');
            } else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Invalid Token format" || error.response.data.message === "Forbidden: Invalid Token") {
                localStorage.removeItem("token");
                navigate('/login');
            }
        } finally {
            setDesignation('');
            setType('');
            setStatus('Disponible');
            setImage(null);
            setErrors({});
        }
    };

    return (
        <>
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {mat != null ? "Editer Materiel" : "Ajouter Materiel"}
                </h3>
            </div>

            <div className="gap-4 mb-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="designation" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">designation</label>
                    <input
                        type="text"
                        name="designation"
                        id="designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-3"
                        placeholder="designation"
                        required=""
                    />
                    {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
                </div>

                <div>
                    <label htmlFor="type" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Type</label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                    >
                        <option value="">Sélectionner une catégorie</option>
                        <option value="Consommable">Consommable</option>
                        <option value="Non Consommable">Non Consommable</option>
                    </select>
                    {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                </div>

                {mat && (
                    <div>
                        <label htmlFor="status" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Statut</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                        >
                            <option value="">Sélectionner le statut</option>
                            <option value="Disponible">Disponible</option>
                            <option value="Emprunté">Emprunté</option>
                        </select>
                        {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                    </div>
                )}

                <div>
                    <label htmlFor="image" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                    <input
                        type="file"
                        name="image"
                        id="image"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-3"
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                type="submit"
                className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
                {mat ? "Modifier" : "Ajouter"}
            </button>
        </>
    );
};

export default MaterialMng;
