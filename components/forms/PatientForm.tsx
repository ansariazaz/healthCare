"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomForm from "../CustomForm";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { UserFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";
export enum FormFieldType {
    INPUT= 'input',
    TEXTAREA= 'textarea',
    PHONE_INPUT = 'phoneinput',
    CHECKBOX = 'checkbox',
    DATE_PICKER = 'datePicker',
    SELECT = 'select',
    SKELETON = 'skeleton'
}


const PatientForm = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
  // 1. Define your form.
  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email:"",
      phone:""
    },
  });

  // 2. Define a submit handler.
  const onSubmit= async(values: z.infer<typeof UserFormValidation>)=> {
     
      setIsLoading(true);
        try {
          const user = {
            name: values.name,
            email: values.email,
            phone: values.phone,
          };
          const newUser = await createUser(user);
          if (newUser) {
            router.push(`/patients/${newUser.$id}/register`);
          }
    } catch (error) {
        console.log(error)
        
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1>Hi there 👋</h1>
          <p>Schedule your first appointment</p>
        </section>
         <CustomForm 
         control={form.control}
         fieldType={FormFieldType.INPUT}
         name="name"
         label="Full Name"
         placeholder="John Doe"
         iconSrc = '/assets/icons/user.svg'
         iconAlt = "user"
         />
         <CustomForm 
         control={form.control}
         fieldType={FormFieldType.INPUT}
         name="email"
         label="Email"
         placeholder="Johndoe@gmail.com"
         iconSrc = '/assets/icons/email.svg'
         iconAlt = "email"
         />
          <CustomForm 
         control={form.control}
         fieldType={FormFieldType.PHONE_INPUT}
         name="phone"
         label="Phone Number"
         placeholder="(+91) 7667787398"
         />
        <SubmitButton isLoading={isLoading}>Get started</SubmitButton>
      </form>
    </Form>
  );
};
export default PatientForm;
