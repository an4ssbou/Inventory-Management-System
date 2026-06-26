import React from 'react'
import { Button} from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const SessionExpired = () => {
    const navigate = useNavigate();
    const failure = () => {
        localStorage.removeItem("token");
        navigate("/login")
    }
  return (
    <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Your Session Is Expired
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={failure}>
                Login
              </Button>
            </div>
    </div>
  )
}

export default SessionExpired