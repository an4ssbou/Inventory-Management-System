import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import { API_BASE_URL } from '../utils/api';

const AddUser = ({ user = null, onUserChange }) => {
    const navigate = useNavigate();
    const [nom, setNom] = useState(user ? user.nom : '');
    const [prenom, setPrenom] = useState(user ? user.prénom : '');
    const [email, setEmail] = useState(user ? user.email : '');
    const [password,setPassword] = useState(user ? user.password : '')
    const [phone, setPhone] = useState(user ? user.Phone : '');
    const [role, setRole] = useState(user ? user.Role : '');
    const [errors, setErrors] = useState({});
    const token = localStorage.getItem("token")

    useEffect(() => {
        if (user) {
            setNom(user.nom || '');
            setPrenom(user.prénom || '');
            setEmail(user.email || '');
            setPassword(user.password || '')
            setPhone(user.Phone || '');
            setRole(user.Role || '');
        } else {
            setNom('');
            setPrenom('');
            setEmail('');
            setPassword('')
            setPhone('');
            setRole('');
        }
    }, [user]);

    const validate = () => {
        const newErrors = {};
        if (!nom) newErrors.nom = "Nom est requis";
        if (!prenom) newErrors.prenom = "Prénom est requis";
        if (!email) {
            newErrors.email = "Email est requis";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email n'est pas valide";
        }
        if (!phone) {
            newErrors.phone = "Phone est requis";
        } else if (!/^\d+$/.test(phone)) {
            newErrors.phone = "Phone doit contenir uniquement des chiffres";
        }
        if (!role) newErrors.role = "Role est requis";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const userData = { 
            nom, 
            prénom: prenom, 
            email, 
            password,
            Phone: phone, 
            Role: role 
        };
        
        try {
            if (user) {
                await axios.put(`${API_BASE_URL}/api/user/${user._id}`, userData,{
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
            } else {
                await axios.post(`${API_BASE_URL}/api/user`, userData,{
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
            }  
            onUserChange();
        } catch (error) {
            console.log(error);
            if (error.response.data.message === 'Only admins are allowed to access this page') {
                navigate('/');
              }else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Ivalid Token format" || error.response.data.message === "Forbidden: Ivalid Token"){
                localStorage.removeItem("token");
                navigate('/login')
              }
        } finally {
            setNom('');
            setPrenom('');
            setEmail('');
            setPassword('')
            setPhone('');
            setRole('');
            setErrors({});
        }
    };

    return (
        <>
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user != null ? "Editer Utilisateur" : "Ajouter Utilisateur"}
                </h3>
            </div>

            <div className="gap-4 mb-4 sm:grid-cols-2">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="nom" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Nom</label>
                        <input
                            type="text"
                            name="nom"
                            id="nom"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                            placeholder="Nom d'utilisateur"
                            required=""
                        />
                        {errors.nom && <p className="text-red-500 text-sm">{errors.nom}</p>}
                    </div>
                    <div>
                        <label htmlFor="prénom" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Prénom</label>
                        <input
                            type="text"
                            name="prénom"
                            id="prénom"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                            placeholder="Prénom d'utilisateur"
                            required=""
                        />
                        {errors.prenom && <p className="text-red-500 text-sm">{errors.prenom}</p>}
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Adresse E-mail</label>
                    <input
                        type="text"
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                        placeholder="example@gmail.com"
                        required=""
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                {
                    !user &&
                    <div>
                    <label htmlFor="password" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                        placeholder="••••••••"
                        required=""
                    />
                    </div>
                }
                
                <div>
                    <label htmlFor="Phone" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
                    <input
                        type="text"
                        name="Phone"
                        id="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                        placeholder=""
                        required=""
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>
                <div>
                    <label htmlFor="Role" className="block mt-3 mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                    <select
                        id="Role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 mb-2"
                    >
                        <option value="">Select category</option>
                        <option value="Equipe Système">Equipe Système</option>
                        <option value="Equipe Maintenance">Equipe Maintenance</option>
                        <option value="Equipe Réseaux">Equipe Réseaux</option>
                    </select>
                    {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                </div>
            </div>
            <button
                onClick={handleSubmit}
                type="submit"
                className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
                {user ? "Modifier" : (
                    <>
                        <svg className="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                        </svg> Ajouter
                    </>
                )}
            </button>
        </>
    );
};

export default AddUser;
