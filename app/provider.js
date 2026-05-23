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
    const unsubscribe = onAuthStateChanged(auth, async(firebaseUser)=>{
      
      if(firebaseUser){
        try {
          const result = await CreateUser({
            name: firebaseUser?.displayName,
            email: firebaseUser?.email,
            pictureURL: firebaseUser?.photoURL
          });
          setUser(result);
        } catch (err) {
          console.error('Error creating user in Convex:', err);
          setUser(null);
        }
      } else {
        setUser(null);
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