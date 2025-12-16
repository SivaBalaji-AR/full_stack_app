"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, MapPin, Briefcase, LogOut } from "lucide-react";

interface ProfileData {
  id: string;
  name?: string | null;        // Marked optional
  phone_number?: string | null;// Marked optional
  role?: string | null;        // Marked optional
  created_at?: string;         // Marked optional
  user_addresses?: {
    id: string;
    address_label?: string | null;
    full_address?: string | null;
  }[] | null;
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched profile data:", data);
          setProfile(data.user);
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Even if profile is null, we might want to show something or redirect, 
  // but here we just return null to avoid a crash.
  if (!profile) return null;

  // Safe Access to arrays (default to empty array if null/undefined)
  const addresses = profile.user_addresses || [];

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="destructive" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      {/* --- 1. Basic User Info (Safe Access) --- */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{profile.name || "User"}</CardTitle>
            <CardDescription>{profile.phone_number || "No Phone"}</CardDescription>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary">
              {profile.role ? profile.role.toUpperCase() : "UNKNOWN"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Member since: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* --- 3. Saved Addresses (Safe Map) --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Saved Addresses</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              + Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Check the safe 'addresses' variable, not the potentially null profile field */}
          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No addresses saved yet.
            </p>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-sm">{addr.address_label || "Address"}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.full_address || "No details provided"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}