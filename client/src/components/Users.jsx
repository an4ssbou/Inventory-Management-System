import React,{useEffect,useState} from 'react'
import { Checkbox, Table, Dropdown,Pagination,Button, Modal, TableCell } from "flowbite-react";
import axios from 'axios';
import { FaRegTrashAlt,FaUserEdit  } from "react-icons/fa";
import UserMng from './UserMng';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import SessionExpired from './SessionExpired';
import {useNavigate} from 'react-router-dom'
import Loading from './Loading';


const User = () => {
  const navigate = useNavigate();
  const [users,setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [tokenExpired,setTokenExpired] = useState(false)
  const [selectedUser,setSelectedUser] = useState(null);
  const [checkedUsers, setCheckedUsers] = useState([]);
  const token = localStorage.getItem("token")
  const [loading, setLoading] = useState(true);
  const [search,setSearch] = useState('');

  const getUsers = async() => {
    try {
      const res = await axios.get(search !== '' ? `http://localhost:4000/api/users?nom=${search}` : "http://localhost:4000/api/users",{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data.users)
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
      await getUsers();
      setLoading(false);
    }
    fetchData()
  },[search])

  if(loading){
    return <Loading/>
  }

  const handleUserChange = () => {
    getUsers();
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleDeleteCheckedUsers = async () => {
    try {
      await Promise.all(
        checkedUsers.map(async (user) => {
          await axios.delete(`http://localhost:4000/api/user/${user._id}`,{
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        })
      );
      getUsers();
      setCheckedUsers([]);
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


  const handleCheckChange = (user) => {
    if (checkedUsers.includes(user)) {
      setCheckedUsers(checkedUsers.filter((checkedUser) => checkedUser !== user));
    } else {
      setCheckedUsers([...checkedUsers, user]);
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
        options={users.map((option) => option.nom)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search By Name"
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
                    <button onClick={() => setOpenModal(true)} type="button" className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                        <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                        </svg>
                        Ajouter Utilisateur
                    </button>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <Dropdown label="Actions" dismissOnClick={false} color="gray">
                            <Dropdown.Item>Delete All</Dropdown.Item>
                            <Dropdown.Item onClick={handleDeleteCheckedUsers}>Delete Checked</Dropdown.Item>
                            
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
          <Table.HeadCell>Nom</Table.HeadCell>
          <Table.HeadCell>Prénom</Table.HeadCell>
          <Table.HeadCell>Email</Table.HeadCell>
          <Table.HeadCell>Téléphone</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Edit</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {
            users.map((user)=>(
              <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="p-4">
                <Checkbox 
                  checked={checkedUsers.includes(user)}
                  onChange={() => handleCheckChange(user)}
                />
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap  dark:text-white">
                {user.nom}
              </Table.Cell>
              <Table.Cell>{user.prénom}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.Phone}</Table.Cell>
              <Table.Cell>{user.Role}</Table.Cell>
              <Table.Cell>
                <a onClick={() => {
                 setSelectedUser(user);
                 setOpenModal(true);
                }} className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                  <FaUserEdit/> 
                </a>
              </Table.Cell>
              <Table.Cell>
                <a onClick={async () =>{
                     try {
                      await axios.delete(`http://localhost:4000/api/user/${user._id}`,{
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      })
                      getUsers()
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
                    <span className="font-semibold text-gray-900 dark:text-white">{users.length === 0 ? '0' : '1'}-{users.length >= 6 ? "6" : users.length}</span>
                    of
                    <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span>
                </span>
               
            </nav>
        </div>
    </div>
    <Modal show={tokenExpired} size="md" onClose={() => {setTokenExpired(false);navigate('/login')}} popup>
          <Modal.Header />
          <Modal.Body>
            <SessionExpired />
          </Modal.Body>
        </Modal>
    <Modal show={openModal} size="md" onClose={() => {setOpenModal(false); setSelectedUser(null)}} popup>
        <Modal.Header />
        <Modal.Body>
          <UserMng user={selectedUser} onUserChange={handleUserChange} />
        </Modal.Body>
      </Modal>
    </section>

  )
}

export default User