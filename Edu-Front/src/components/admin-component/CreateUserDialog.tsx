"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSignupMutation } from "@/features/auth/authApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { PlusCircle } from "lucide-react";
import { useGetStudentsQuery, useGetTeachersQuery } from "@/features/usersApi/usersApi";

const userSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string(),
  department: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface CreateUserDialogProps {
  role: "student" | "teacher";
  title: string;
}

export function CreateUserDialog({ role, title }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [signup, { isLoading }] = useSignupMutation();
  const { refetch: refetchStudents } = useGetStudentsQuery();
  const { refetch: refetchTeachers } = useGetTeachersQuery();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: role,
      department: "",
    },
  });

  const getErrorMessage = (error: any): string => {
    if (!error) return "";
    if (error.data?.message) return error.data.message;
    return error.message || "Failed to create user";
  };

  async function onSubmit(data: UserFormValues) {
    const payload = { ...data };
    if (role !== "student") {
      delete payload.department;
    }
    
    try {
      await signup(payload).unwrap();
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`);
      
      // Refetch the respective list
      if (role === "student") {
        refetchStudents();
      } else {
        refetchTeachers();
      }
      
      form.reset();
      setOpen(false);
    } catch (err) {
      console.error(`Failed to create ${role}:`, err);
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {title}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the details to create a new {role} account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={isLoading} placeholder="johndoe@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {role === "student" && (
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Computer Science" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
