import React,{useEffect,useState} from 'react'
import { Checkbox, Table, Dropdown,Pagination,Button, Modal, TableCell } from "flowbite-react";
import axios from 'axios';
import { FaRegTrashAlt,FaUserEdit  } from "react-icons/fa";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import moment from 'moment'
import LoanMng from './LoanMng';
import {useNavigate} from 'react-router-dom'
import SessionExpired from './SessionExpired';
import Loading from './Loading';
import { ToastContainer, toast } from 'react-toastify';
import { API_BASE_URL } from '../utils/api';


const Loan = () => {
  const navigate = useNavigate();
  const [loans,setLoans] = useState([]);
  const [tokenExpired,setTokenExpired] = useState(false)
  const [openModal, setOpenModal] = useState(false);
  const [selectedLoan,setSelectedLoan] = useState(null);
  const [checkedLoans, setCheckedLoans] = useState([]);
  const token = localStorage.getItem("token")
  const [loading, setLoading] = useState(true);
  const [search,setSearch] = useState('');

  const getLoans = async() => {
    try {
      const res = await axios.get(search !== '' ? `${API_BASE_URL}/api/requests?status=Validée&matériel=${search}`: `${API_BASE_URL}/api/requests?status=Validée`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLoans(res.data.requests)
    } catch (error) {
      console.log(error.message)
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
  
  useEffect(()=>{
    const fetchData = async() => {
    await getLoans();
    setLoading(false)
    }
    fetchData()
  },[search])

  if(loading){
    return <Loading/>
  }

  const handleLoanChange = () => {
    getLoans();
    setOpenModal(false);
    setSelectedLoan(null);
  };

  const handleDeleteCheckedMaterial = async () => {
    try {
      await Promise.all(
        checkedLoans.map(async (loan) => {
          await axios.delete(`${API_BASE_URL}/api/request/${loan._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        })
      );
      getLoans();
      setCheckedLoans([]);
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


  const handleCheckChange = (loan) => {
    if (checkedLoans.includes(loan)) {
      setCheckedLoans(checkedLoans.filter((checkedLoan) => checkedLoan !== loan));
    } else {
      setCheckedLoans([...checkedLoans, loan]);
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
        options={loans.map((option) => option.matériel.designation)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search by matériel"
            InputProps={{
              ...params.InputProps,
              type: 'search',
            }}
            onChange={(e) => {setSearch(e.target.value);}}
          />
        )}
      />
                </div>
                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <Dropdown label="Actions" dismissOnClick={false} color="gray">
                            <Dropdown.Item>Delete All</Dropdown.Item>
                            <Dropdown.Item onClick={handleDeleteCheckedMaterial}>Delete Checked</Dropdown.Item>
                            
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
          <Table.HeadCell>
            <span className="sr-only">Edit</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {
            loans.map((loan)=>(
              <Table.Row key={loan._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="p-4">
                <Checkbox 
                  checked={checkedLoans.includes(loan)}
                  onChange={() => handleCheckChange(loan)}
                />
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap  dark:text-white">
                {loan.utilisateur.nom + ' ' + loan.utilisateur.prénom}
              </Table.Cell>
              <Table.Cell>{loan.matériel.designation}</Table.Cell>
              <Table.Cell>{moment(loan.prise).format('DD-MM-YYYY')}</Table.Cell>
              <Table.Cell>{moment(loan.retour).format('DD-MM-YYYY')}</Table.Cell>
              <Table.Cell>
                <a onClick={() => {
                 setSelectedLoan(loan);
                 setOpenModal(true);
                }} className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                  <FaUserEdit/> 
                </a>
              </Table.Cell>
              <Table.Cell>
                <a onClick={async () =>{
                     try {
                      await axios.delete(`${API_BASE_URL}/api/request/${loan._id}`,{
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
                      getLoans()
                     } catch (error) {
                      console.log(error)
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
                    <span className="font-semibold text-gray-900 dark:text-white">{loans.length === 0 ? '0' : '1'}-{loans.length >= 6 ? "6" : loans.length}</span>
                    of
                    <span className="font-semibold text-gray-900 dark:text-white">{loans.length}</span>
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
    <Modal show={openModal} size="md" onClose={() => {setOpenModal(false); setSelectedLoan(null)}} popup>
        <Modal.Header />
        <Modal.Body>
          <LoanMng loan={selectedLoan} onLoanChange={handleLoanChange} />
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

export default Loan
