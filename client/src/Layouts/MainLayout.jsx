import React from 'react'
import {Outlet} from 'react-router-dom'
import Navbar from '../components/Navbar'
import DemoNotice from '../components/DemoNotice'

const MainLayout = () => {
  return (
    <>
       <DemoNotice/>
       <Navbar/>
       <Outlet/>
    </>
    
  )
}

export default MainLayout