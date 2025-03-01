"use client"
import React, { useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/configs/firebaseConfig'
import { AuthContext } from './_context/AuthContext'
import { useMutation } from "convex/react";
import { api } from '@/convex/_generated/api'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
function Provider({children}) {

  const[user,setUser] = useState();
  const CreateUser = useMutation(api.users.CreateNewUser);
  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, async(user)=>{
      console.log(user);
      
      if(user){
      const result = await CreateUser({
        name: user?.displayName,
        email: user?.email,
        pictureURL: user?.photoURL
      });
      console.log(result);
      setUser(result);
    }
    })
    return ()=>unsubscribe();
  },[])

  const value = React.useMemo(() => ({ user }), [user]);

  return (
    <div>
      
      <AuthContext.Provider value={{user, setUser}}>
      <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
        <NextThemesProvider
         attribute="class"
         defaultTheme="dark"
         enableSystem
         disableTransitionOnChange
         >
            {children}
        </NextThemesProvider>
        </PayPalScriptProvider>
        </AuthContext.Provider>

    </div>
  )
}

export const useAuthContext = () =>{
  const context = useContext(AuthContext);
  return context;
}
export default Provider