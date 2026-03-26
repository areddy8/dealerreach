"use client";

import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword, listProducts, listClients } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Account stats
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalClients, setTotalClients] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      listProducts()
        .then((products) => setTotalProducts(products.length))
        .catch(() => setTotalProducts(0));
      listClients()
        .then((clients) => setTotalClients(clients.length))
        .catch(() => setTotalClients(0));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
      </div>
    );
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);

    try {
      await updateProfile({ name, email });
      setProfileSuccess("Profile updated successfully.");
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-[#E8E4DE] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#6B6560]/50 focus:border-[#B8965A] focus:outline-none focus:ring-1 focus:ring-[#B8965A]";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">Profile</h1>

      {/* Section 1: Profile Information */}
      <div className="mb-6 rounded-xl border border-[#E8E4DE] bg-white p-6">
        <h2 className="mb-4 font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">Profile Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#1A1A1A]">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#1A1A1A]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          {user.company_name && (
            <p className="text-sm text-[#6B6560]">Company: {user.company_name}</p>
          )}
          <p className="text-sm text-[#6B6560]">Member since {memberSince}</p>
          {profileSuccess && (
            <p className="text-sm text-green-600">{profileSuccess}</p>
          )}
          {profileError && (
            <p className="text-sm text-red-600">{profileError}</p>
          )}
          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-lg bg-[#B8965A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#A07D48] disabled:opacity-50"
          >
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Section 2: Change Password */}
      <div className="mb-6 rounded-xl border border-[#E8E4DE] bg-white p-6">
        <h2 className="mb-4 font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-[#1A1A1A]">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-[#1A1A1A]">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClasses}
              required
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[#1A1A1A]">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
              required
              minLength={6}
            />
          </div>
          {passwordSuccess && (
            <p className="text-sm text-green-600">{passwordSuccess}</p>
          )}
          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-lg bg-[#B8965A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#A07D48] disabled:opacity-50"
          >
            {passwordSaving ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Section 3: Account Stats */}
      <div className="rounded-xl border border-[#E8E4DE] bg-white p-6">
        <h2 className="mb-4 font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">Account Stats</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6560]">Products</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {totalProducts !== null ? totalProducts : "..."}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6560]">Clients</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {totalClients !== null ? totalClients : "..."}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6560]">Member Since</span>
            <span className="text-sm font-medium text-[#1A1A1A]">{memberSince}</span>
          </div>
          {user.subscription_tier && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6560]">Plan</span>
              <span className="text-sm font-medium capitalize text-[#B8965A]">{user.subscription_tier}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
