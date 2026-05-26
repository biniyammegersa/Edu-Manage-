"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
    role: z.literal("community")
});

type SignupFormValues = z.infer<typeof signupSchema>;

const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    const errorData = (error as FetchBaseQueryError).data as any;
    return errorData?.message || "Failed to create account";
  }
  return error.message || "Failed to create account";
};

export default function SignupPage() {
  const router = useRouter();
  const [signup, { isLoading, error }] = useSignupMutation();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "community"
    },
  });

  async function onSubmit(data: SignupFormValues) {
    try {
      const result = await signup(data).unwrap();
      console.log("Signup successful:", result);
      
      toast.success("Account created successfully!");
      router.replace("/");
        
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(getErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Account</h2>
        <div className="mt-2 h-1 w-12 bg-[#1a9e7a] mx-auto rounded-full"></div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Full Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} className="bg-background border-input" />
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
                <FormLabel className="text-foreground font-medium">Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" disabled={isLoading} className="bg-background border-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" disabled={isLoading} className="bg-background border-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-sm text-destructive text-center">
              {getErrorMessage(error)}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#1a9e7a] hover:bg-[#158a6a] text-white font-semibold transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1a9e7a] hover:text-[#158a6a] font-semibold transition-colors duration-200"
            >
              Log In
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

 