import React,{useEffect,useState} from 'react'
import { Checkbox, Table, Dropdown,Pagination,Button, Modal, TableCell } from "flowbite-react";
import axios from 'axios';
import { FaRegTrashAlt,FaUserEdit  } from "react-icons/fa";
import RequestMng from './RequestMng';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { GrValidate } from "react-icons/gr";
import moment from 'moment'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoMdCloseCircle } from "react-icons/io";
import {useNavigate} from 'react-router-dom'
import SessionExpired from './SessionExpired';
import ExportRequestsButton from './ExportRequestsButton';
import Loading from './Loading';
import { API_BASE_URL } from '../utils/api';



const Request = () => {
  const navigate = useNavigate();
  const [requests,setRequests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [tokenExpired,setTokenExpired] = useState(false)
  const [selectedRequest,setSelectedRequest] = useState(null);
  const [checkedRequests, setCheckedRequests] = useState([]);
  const [search,setSearch] = useState('')
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  const getRequests = async() => {
    try {
      const res = await axios.get(search === '' ? `${API_BASE_URL}/api/requests` : `${API_BASE_URL}/api/requests?matériel=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRequests(res.data.requests)
    } catch (error) {
      console.log(error)
      if (error.response.data.message === 'Only admins are allowed to access this page') {
        navigate('/');
      }else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Ivalid Token format" || error.response.data.message === "Forbidden: Ivalid Token"){
        if(token){
          setTokenExpired(true)
          localStorage.removeItem("token");
        }else{
          navigate('/login')
        }
      }
    }
  }

  const handleStatusUpdateError = (error) => {
    const message = error?.response?.data?.message || error?.response?.data?.error || error.message;
    console.error('Request status update failed:', message);

    if (message === 'Only admins are allowed to access this page') {
      navigate('/');
      return;
    }

    if (
      message === "Unauthorized: Missing token!" ||
      message === "Unauthorized: Ivalid Token format" ||
      message === "Unauthorized: Invalid Token format" ||
      message === "Forbidden: Ivalid Token" ||
      message === "Forbidden: Invalid Token"
    ) {
      localStorage.removeItem("token");
      navigate('/login');
      return;
    }

    toast.error(message || 'Impossible de mettre à jour la demande', {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const validateRequest = async(request) => {
    try {
      await axios.put(`${API_BASE_URL}/api/request/${request._id}`, { status: "Validée" }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Demande validée avec succès', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      getRequests();
    } catch (error) {
      handleStatusUpdateError(error);
    }
  }


const rejectRequest = async(request) => {
  try {
      await axios.put(`${API_BASE_URL}/api/request/${request._id}`, { status: "Refusée" }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      toast.success('Demande refusée avec succès', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      getRequests();
  } catch (error) {
      handleStatusUpdateError(error);
  }
}
  

  useEffect(()=>{
    const fetchData = async() =>{
    await getRequests();
    setLoading(false)
    }
    fetchData()
  },[search])

  if(loading){
    return <Loading/>
  }

  const handleRequestChange = () => {
    getRequests();
    setOpenModal(false);
    setSelectedRequest(null);
  };

  const handleDeleteAll = async() =>{
    try {
        await axios.delete(`${API_BASE_URL}/api/requests/`,{
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        getRequests()
    } catch (error) {
        console.log(error);
        if (error.response.data.message === 'Only admins are allowed to access this page') {
           navigate('/');
          }else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Ivalid Token format" || error.response.data.message === "Forbidden: Ivalid Token"){
            localStorage.removeItem("token");
            navigate('/login')
          }
    }
  }

  const handleDeleteCheckedRequests = async () => {
    try {
      await Promise.all(
        checkedRequests.map(async (request) => {
          await axios.delete(`${API_BASE_URL}/api/request/${request._id}`,{
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        })
      );
      getRequests();
      setCheckedRequests([]);
    } catch (error) {
      console.log(error.message);
      if (error.response.data.message === 'Only admins are allowed to access this page') {
        navigate('/');
      }else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Ivalid Token format" || error.response.data.message === "Forbidden: Ivalid Token"){
        localStorage.removeItem("token");
        navigate('/login')
      }
    }
  };


  const handleCheckChange = (request) => {
    if (checkedRequests.includes(request)) {
      setCheckedRequests(checkedRequests.filter((checkedUser) => checkedUser !== request));
    } else {
      setCheckedRequests([...checkedRequests, request]);
    }
  };


  return (
    <section className="bg-gray-200 dark:bg-gray-900 p-3 sm:p-5">
    <div className="mx-auto max-w-screen-xl px-4">
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div className="w-full md:w-1/2">
                    <Autocomplete
        freeSolo
        id="free-solo-2-demo"
        disableClearable
        options={requests.map((option) => option.matériel.designation)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search By matériel"
            InputProps={{
              ...params.InputProps,
              type: 'search',
            }}
            onChange={(e)=>setSearch(e.target.value)}
          />
        )}
      />
                </div>
                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                    <button onClick={() => setOpenModal(true)} type="button" className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                        <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                        </svg>
                        Ajouter Demande
                    </button>
                    <ExportRequestsButton />
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <Dropdown label="Actions" dismissOnClick={false} color="gray">
                            <Dropdown.Item onClick={handleDeleteAll}>Delete All</Dropdown.Item>
                            <Dropdown.Item onClick={handleDeleteCheckedRequests}>Delete Checked</Dropdown.Item>
                            
                        </Dropdown>
                        <Dropdown label="Filter" dismissOnClick={false} color="gray">
                            <Dropdown.Item>Dashboard</Dropdown.Item>
                            <Dropdown.Item>Settings</Dropdown.Item>
                            
                        </Dropdown>
                        
                       
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
            <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell className="p-4">
            <Checkbox />
          </Table.HeadCell>
          <Table.HeadCell>Utilisateur</Table.HeadCell>
          <Table.HeadCell>Matériel</Table.HeadCell>
          <Table.HeadCell>Date de prise</Table.HeadCell>
          <Table.HeadCell>Date de retour</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Edit</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {
            requests.map((request)=>(
              <Table.Row key={request._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="p-4">
                <Checkbox 
                  checked={checkedRequests.includes(request)}
                  onChange={() => handleCheckChange(request)}
                />
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap  dark:text-white">
                {request.utilisateur.nom + ' ' + request.utilisateur.prénom}
              </Table.Cell>
              <Table.Cell>{request.matériel.designation}</Table.Cell>
              <Table.Cell>{moment(request.prise).format('DD-MM-YYYY')}</Table.Cell>
              <Table.Cell>{request.retour === null ? '------' : moment(request.retour).format('DD-MM-YYYY')}</Table.Cell>
              <Table.Cell>{request.status}</Table.Cell>
              <Table.Cell>
                <a onClick={() => {
                 setSelectedRequest(request);
                 setOpenModal(true);
                }} className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                  <FaUserEdit/> 
                </a>
              </Table.Cell>
              {request.status !== 'Validée' && request.status !== 'Refusée' &&
                <Table.Cell>
                <a onClick={()=>validateRequest(request)}>
                  <GrValidate color="green" />
                </a>
              </Table.Cell>
              || <Table.Cell>
                    <GrValidate color="grey" />
                </Table.Cell>}
              {request.status !== 'Validée' && request.status !== 'Refusée' &&
                <Table.Cell>
                <a onClick={()=> rejectRequest(request)}>
                  <IoMdCloseCircle  color="red" />
                </a>
              </Table.Cell>
              || <Table.Cell>
                  <IoMdCloseCircle  color="grey" />
                </Table.Cell>}
              
              <Table.Cell>
                <a onClick={async () =>{
                     try {
                      await axios.delete(`${API_BASE_URL}/api/request/${request._id}`,{
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      })
                      toast.success('Demande supprimée avec succées', {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                        });
                      getRequests()
                     } catch (error) {
                      console.log(error.message)
                      if (error.response.data.message === 'Only admins are allowed to access this page') {
                        navigate('/');
                      }else if (error.response.data.message === "Unauthorized: Missing token!" || error.response.data.message === "Unauthorized: Ivalid Token format" || error.response.data.message === "Forbidden: Ivalid Token"){
                        localStorage.removeItem("token");
                        navigate('/login')
                      }
                     }
                }}>
                  <FaRegTrashAlt color="red"/>
                </a>
              </Table.Cell>
             
            </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    </div>
            </div>
            <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Showing
                    <span className="font-semibold text-gray-900 dark:text-white">{requests.length === 0 ? '0' : '1'}-{requests.length >= 6 ? "6" : requests.length}</span>
                    of
                    <span className="font-semibold text-gray-900 dark:text-white">{requests.length}</span>
                </span>
               
            </nav>
        </div>
    </div>
    <Modal show={tokenExpired} size="md" onClose={() => setTokenExpired(false)} popup>
          <Modal.Header />
          <Modal.Body>
            <SessionExpired />
          </Modal.Body>
        </Modal>
    <Modal show={openModal} size="md" onClose={() => {setOpenModal(false); setSelectedRequest(null)}} popup>
        <Modal.Header />
        <Modal.Body>
          <RequestMng request={selectedRequest} onRequestChange={handleRequestChange} />
        </Modal.Body>
      </Modal>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        />
    </section>

  )
}

export default Request
