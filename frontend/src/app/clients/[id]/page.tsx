"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getClient, listProjects, createProject } from "@/lib/api";
import type { Client, ClientProject } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-800",
  review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !params.id) return;

    Promise.all([getClient(params.id), listProjects(params.id)])
      .then(([c, p]) => {
        setClient(c);
        setProjects(p);
        setEditName(c.name);
        setEditEmail(c.email);
        setEditPhone(c.phone || "");
        setEditCompany(c.company || "");
        setEditNotes(c.notes || "");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load client")
      )
      .finally(() => setLoading(false));
  }, [user, params.id]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !projectName.trim()) return;
    setCreatingProject(true);
    setError("");
    try {
      const project = await createProject({
        client_id: client.id,
        name: projectName.trim(),
      });
      setProjects((prev) => [...prev, project]);
      setProjectName("");
      setShowNewProject(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project"
      );
    } finally {
      setCreatingProject(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B8965A] border-t-transparent" />
      </div>
    );
  }

  if (!client && !loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 text-center">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
          Client not found
        </h2>
        <Link
          href="/clients"
          className="mt-4 inline-block text-sm text-[#B8965A] hover:text-[#A07D48] transition-colors"
        >
          &larr; Back to Clients
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-[#E8E4DE] bg-[#FAF8F5] px-4 py-2.5 text-[#1A1A1A] placeholder-[#6B6560]/50 focus:border-[#B8965A] focus:outline-none focus:ring-1 focus:ring-[#B8965A] transition-colors";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/clients"
        className="text-sm text-[#B8965A] hover:text-[#A07D48] transition-colors"
      >
        &larr; Back to Clients
      </Link>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Client Info */}
      {client && (
        <div className="mt-6 rounded-xl border border-[#E8E4DE] bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1A1A1A]">
                {client.name}
              </h1>
              {client.company && (
                <p className="mt-1 text-[#6B6560]">{client.company}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="text-sm text-[#B8965A] hover:text-[#A07D48] transition-colors"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {!editing ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-[#1A1A1A]">{client.email}</p>
              {client.phone && (
                <p className="text-sm text-[#6B6560]">{client.phone}</p>
              )}
              {client.notes && (
                <p className="mt-3 text-sm text-[#6B6560] whitespace-pre-wrap">
                  {client.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className={inputClass}
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  className={inputClass}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
              <p className="text-xs text-[#6B6560]">
                Client editing via API coming soon.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#1A1A1A]">
            Projects
          </h2>
          <button
            type="button"
            onClick={() => setShowNewProject(true)}
            className="inline-flex items-center rounded-lg bg-[#B8965A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A07D48]"
          >
            Create Project
          </button>
        </div>

        {/* New Project Modal */}
        {showNewProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl border border-[#E8E4DE] bg-white p-6 shadow-lg">
              <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#1A1A1A]">
                New Project
              </h3>
              <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
                  >
                    Project Name
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    required
                    className={inputClass}
                    placeholder="e.g. Kitchen Remodel"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewProject(false);
                      setProjectName("");
                    }}
                    className="rounded-lg border border-[#E8E4DE] px-4 py-2 text-sm text-[#6B6560] transition-colors hover:bg-[#F0EDE8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProject || !projectName.trim()}
                    className="rounded-lg bg-[#B8965A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A07D48] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingProject ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project list */}
        {projects.length === 0 && !loading && (
          <p className="mt-4 text-sm text-[#6B6560]">
            No projects yet. Create one to start curating products for this
            client.
          </p>
        )}

        {projects.length > 0 && (
          <div className="mt-4 space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-xl border border-[#E8E4DE] bg-white p-4 transition-shadow hover:shadow-sm"
              >
                <div>
                  <h4 className="font-[family-name:var(--font-serif)] text-lg text-[#1A1A1A]">
                    {project.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {statusLabel(project.status)}
                    </span>
                    <span className="text-xs text-[#6B6560]">
                      Created{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-sm text-[#B8965A] hover:text-[#A07D48] transition-colors"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
