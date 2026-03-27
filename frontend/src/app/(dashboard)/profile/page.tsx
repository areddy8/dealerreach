"use client";

import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword, listProducts, listClients } from "@/lib/api";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalClients, setTotalClients] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      listProducts().then((p) => setTotalProducts(p.length)).catch(() => setTotalProducts(0));
      listClients().then((c) => setTotalClients(c.length)).catch(() => setTotalClients(0));
    }
  }, [user]);

  if (!user) return null;

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
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
    if (newPassword.length < 6) { setPasswordError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match."); return; }
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

  const inputClass = "w-full bg-transparent border-0 border-b border-surface/20 py-3 text-sm text-surface placeholder-surface/30 focus:border-primary focus:outline-none transition-colors";
  const labelClass = "block font-label text-[10px] uppercase tracking-[0.2em] text-surface/50 mb-2";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="font-headline text-3xl font-light text-surface mb-8">Profile</h1>

      {/* Profile Information */}
      <div className="bg-surface/5 rounded-lg p-6 md:p-8 mb-6">
        <h2 className="font-headline text-xl text-surface mb-6">Profile Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className={labelClass}>Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
          </div>
          {user.company_name && <p className="text-sm text-surface/50">Company: {user.company_name}</p>}
          <p className="text-sm text-surface/40">Member since {memberSince}</p>
          {profileSuccess && <p className="text-sm text-green-400">{profileSuccess}</p>}
          {profileError && <p className="text-sm text-error">{profileError}</p>}
          <button type="submit" disabled={profileSaving} className="bg-primary text-on-primary px-6 py-2.5 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all disabled:opacity-50">
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-surface/5 rounded-lg p-6 md:p-8 mb-6">
        <h2 className="font-headline text-xl text-surface mb-6">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <label htmlFor="currentPassword" className={labelClass}>Current Password</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="newPassword" className={labelClass}>New Password</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} required minLength={6} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} required minLength={6} />
          </div>
          {passwordSuccess && <p className="text-sm text-green-400">{passwordSuccess}</p>}
          {passwordError && <p className="text-sm text-error">{passwordError}</p>}
          <button type="submit" disabled={passwordSaving} className="bg-primary text-on-primary px-6 py-2.5 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all disabled:opacity-50">
            {passwordSaving ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Account Stats */}
      <div className="bg-surface/5 rounded-lg p-6 md:p-8">
        <h2 className="font-headline text-xl text-surface mb-6">Account Stats</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface/50">Products</span>
            <span className="text-sm font-medium text-surface">{totalProducts !== null ? totalProducts : "..."}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface/50">Clients</span>
            <span className="text-sm font-medium text-surface">{totalClients !== null ? totalClients : "..."}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface/50">Member Since</span>
            <span className="text-sm font-medium text-surface">{memberSince}</span>
          </div>
          {user.subscription_tier && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface/50">Plan</span>
              <span className="text-sm font-medium text-primary capitalize">{user.subscription_tier}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
