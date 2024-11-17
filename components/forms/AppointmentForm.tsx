"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form
} from "@/components/ui/form";
import CustomForm from "../CustomForm";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { getAppointmentSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";
import { Doctors } from "@/constant";
import { SelectItem } from "../ui/select";
import { Appointment } from "@/types/appwrite.types";
import Image from "next/image";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { scheduler } from "node:timers/promises";
export enum FormFieldType {
    INPUT = 'input'
    TEXTAREA = 'textarea'
    PHONE_INPUT = 'phoneinput'
    CHECKBOX = 'checkbox'
    DATE_PICKER = 'datePicker'
    SELECT = 'select'
    SKELETON = 'skeleton'
}


const AppointmentForm = ({ userId, patientId, type,appointment,setOpen }: { userId: string, patientId: string, type: "create" | "cancel" | "schedule", appointment?: Appointment,setOpen:(open:boolean)=>void }) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    // 1. Define your form.
    const AppointmentFormValidation = getAppointmentSchema(type);
    const form = useForm<z.infer<typeof AppointmentFormValidation>>({
        resolver: zodResolver(AppointmentFormValidation),
        defaultValues: {
            primaryPhysician: appointment ? appointment?.primaryPhysician : "",
            schedule: appointment
              ? new Date(appointment?.schedule!)
              : new Date(Date.now()),
            reason: appointment ? appointment.reason : "",
            note: appointment?.note || "",
            cancellationReason: appointment?.cancellationReason || "",
          },
    });

    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof AppointmentFormValidation>) => {
        
        setIsLoading(true);
        let status
        switch (type) {
            case 'schedule':
                status = 'scheduled'
                break;
            case 'cancel':
                status = 'cancelled'
                break;
            default:
                status ='pending'
                break;
        }
        try {
           if(type==='create' && patientId){
         
            const appointmentData = {
                userId,
                patient: patientId,
                primaryPhysician:values.primaryPhysician,
                schedule: new Date(values.schedule),
                reason: values.reason!,
                note:values.note,
                status:status as Status
            }
            console.log(appointmentData,"appointmentData")
            const appointment = await createAppointment(appointmentData)
            if(appointment){
                form.reset();
                router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
            }
           }else{
            const appointmentToUpdate = {
                userId,
                appointmentId:appointment?.$id!,
                appointment:{
                  primaryPhysician:values?.primaryPhysician,
                  schedule:new Date(values?.schedule),
                  status:status as Status,
                  cancellationReason:values?.cancellationReason
                },
                type
            }
            const updatedAppointment = await updateAppointment(appointmentToUpdate)

            if(updatedAppointment){
              setOpen && setOpen(false)
              form.reset()
            }
           }

        } catch (error) {
            console.log(error, "kya h")

        }
        setIsLoading(false);
    }
    let buttonLabel;

    switch (type) {
        case 'cancel':
            buttonLabel = 'Cancel Appointment';
            break;
        case 'create':
            buttonLabel = 'Create Appointment'
            break;
        case 'schedule':
            buttonLabel = 'Schedule Appointment'
            break;
        default:
            break;
    }

    return (
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment</h1>
            <p className="text-dark-700">
              Request a new appointment in 10 seconds.
            </p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            <CustomForm
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Doctor"
              placeholder="Select a doctor"
            >
              {Doctors.map((doctor, i) => (
                <SelectItem key={doctor.name + i} value={doctor.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <Image
                      src={doctor.image}
                      width={32}
                      height={32}
                      alt="doctor"
                      className="rounded-full border border-dark-500"
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomForm>

            <CustomForm
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="MM/dd/yyyy  -  h:mm aa"
            />

            <div
              className={`flex flex-col gap-6  ${type === "create" && "xl:flex-row"}`}
            >
              <CustomForm
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Appointment reason"
                placeholder="Annual montly check-up"
                disabled={type === "schedule"}
              />

              <CustomForm
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Comments/notes"
                placeholder="Prefer afternoon appointments, if possible"
                disabled={type === "schedule"}
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomForm
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for cancellation"
            placeholder="Urgent meeting came up"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
    );
};
export default AppointmentForm;
