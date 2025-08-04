'use client'

import React, { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Shield, User, UserCheck } from "lucide-react"
import { useLoginMutation, useRegisterMutation } from "@/lib/store/api/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/store/slices/auth.slice";
import { setAuthToken } from "@/lib/utils/api.utils";

interface LoginFormProps {
  onLogin?: (user: any) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter()
  const dispatch = useDispatch();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "",
  })
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    rollNo: "",
    phone: "",
  })

  const [loginMutation, { isLoading }] = useLoginMutation()
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    debugger
    e.preventDefault()
    setLoginError(null)

    try {
      const result = await loginMutation(loginData).unwrap();
      // Save token and user in Redux
      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.token,
      }));
      setAuthToken(result.data.token); // Persist token in localStorage
      if (onLogin) onLogin(result.data.user);
      // Redirect based on role (uncomment if needed)
      // if (result.data.user.role === "admin") {
      //   router.push("/dashboard/admin-dashboard");
      // } else if (result.data.user.role === "warden") {
      //   router.push("/warden-dashboard");
      // } else if (result.data.user.role === "student") {
      //   router.push("/student-dashboard");
      // }
    } catch {
      setLoginError("Invalid credentials or role mismatch. Please try again.")
    }
  }

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError(null);
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords don't match!");
      return;
    }
    try {
      const result = await registerMutation({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        rollNo: signupData.rollNo,
        phone: signupData.phone,
        role: signupData.role || "student",
      }).unwrap();
      // Save token and user in Redux
      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.token,
      }));
      setAuthToken(result.data.token);
      if (onLogin) onLogin(result.data.user);
      // Optionally redirect based on role
      // router.push("/dashboard/student-dashboard");
    } catch (err: any) {
      setSignupError(err?.data?.message || err?.error || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Hummingbird Tower</h1>
          <p className="text-gray-600 mt-2">IIT Mandi iHub & HCi Foundation</p>
          <p className="text-sm text-gray-500">Hostel Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={loginData.role}
                    onValueChange={(value) =>
                      setLoginData({ ...loginData, role: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </SelectItem>
                      <SelectItem value="warden">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Warden
                      </SelectItem>
                      <SelectItem value="student">
                        <User className="mr-2 h-4 w-4" />
                        Student/Staff
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                {loginError && (
                  <p className="text-red-500 text-sm text-center">
                    {loginError}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={signupData.phone}
                    onChange={(e) =>
                      setSignupData({ ...signupData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNo">Roll No. / ID</Label>
                  <Input
                    id="rollNo"
                    placeholder="Enter your roll number or ID"
                    value={signupData.rollNo}
                    onChange={(e) =>
                      setSignupData({ ...signupData, rollNo: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-role">Role</Label>
                  <Select
                    value={signupData.role}
                    onValueChange={(value) =>
                      setSignupData({ ...signupData, role: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <User className="mr-2 h-4 w-4" />
                        Student/Guest/Staff
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({ ...signupData, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>

                {signupError && (
                  <p className="text-red-500 text-sm text-center">
                    {signupError}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={isRegistering}>
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </div >
  )
}
  