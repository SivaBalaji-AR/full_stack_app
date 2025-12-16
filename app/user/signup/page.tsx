"use client";

import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const {login} = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    if(!name || !phone || !password) {
      alert("Please fill all the required fields");
      return;
    }
    const payload: any = {
      name,
      phone_number: phone,
      password,
    };

    try {
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong!");
      }
      console.log("Signup successful:", data);
      login(data.token);

    } catch (error: any) {
      console.error("Signup error:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Choose your role and fill in the details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Full Name"
                  value = {name}
                  onChange={(e) => setName(e.target.value)}
                  />
              </div>

              {/* Phone Number Field */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your 10-digit phone number"
                  value = {phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value = {password}
                  onChange={(e) => setPassword(e.target.value)}
                  />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col w-full gap-4">
          {/* Submit Button */}
          <Button className="w-full"
           onClick={handleSignUp}>Create Account</Button>

          {/* Link to Login */}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/user/login" className="underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}