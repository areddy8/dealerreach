"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getClient, listProjects, createProject } from "@/lib/api";
import type { Client, ClientProject } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-surface/10 text-surface/50",
  active: "bg-primary/10 text-primary",
  review: "bg-primary-fixed/20 text-primary-fixed-dim",
  approved: "bg-green-900/30 text-green-300",
  completed: "bg-secondary/20 text-secondary-fixed-dim",
};

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();

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
    if (!params.id) return;
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
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load client"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !projectName.trim()) return;
    setCreatingProject(true);
    setError("");
    try {
      const project = await createProject({ client_id: client.id, name: projectName.trim() });
      setProjects((prev) => [...prev, project]);
      setProjectName("");
      setShowNewProject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <h2 className="font-headline text-2xl text-surface">Client not found</h2>
        <Link href="/clients" className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Clients
        </Link>
      </div>
    );
  }

  const inputClass = "w-full bg-transparent border-0 border-b border-surface/20 py-3 text-sm text-surface placeholder-surface/30 focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-fixed transition-colors">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Clients
      </Link>

      {error && (
        <div className="mt-4 rounded bg-error-container/20 px-4 py-3 text-sm text-error">{error}</div>
      )}

      {/* Client Info */}
      <div className="mt-6 bg-surface/5 rounded-lg p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-medium text-xl">{client.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="font-headline text-3xl font-light text-surface">{client.name}</h1>
              {client.company && <p className="mt-1 text-surface/50">{client.company}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="font-label text-xs uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {!editing ? (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-surface/70">{client.email}</p>
            {client.phone && <p className="text-sm text-surface/50">{client.phone}</p>}
            {client.notes && <p className="mt-3 text-sm text-surface/40 whitespace-pre-wrap">{client.notes}</p>}
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-surface/50 mb-2">Name</label>
              <input type="text" className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-surface/50 mb-2">Email</label>
              <input type="email" className={inputClass} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div>
              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-surface/50 mb-2">Phone</label>
              <input type="tel" className={inputClass} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div>
              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-surface/50 mb-2">Company</label>
              <input type="text" className={inputClass} value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
            </div>
            <div>
              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-surface/50 mb-2">Notes</label>
              <textarea rows={3} className={inputClass} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
            <p className="text-xs text-surface/30">Client editing via API coming soon.</p>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-2xl font-light text-surface">Projects</h2>
          <button
            type="button"
            onClick={() => setShowNewProject(true)}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Project
          </button>
        </div>

        {/* New Project Modal */}
        {showNewProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/60">
            <div className="w-full max-w-md bg-on-surface border border-surface/10 rounded-lg p-8 shadow-2xl">
              <h3 className="font-headline text-xl text-surface">New Project</h3>
              <form onSubmit={handleCreateProject} className="mt-6 space-y-6">
                <div>
                  <label htmlFor="projectName" className="block font-label text-[10px] uppercase tracking-[0.2em] text-surface/50 mb-2">
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
                    onClick={() => { setShowNewProject(false); setProjectName(""); }}
                    className="rounded border border-surface/20 px-4 py-2.5 font-label text-xs uppercase tracking-widest text-surface/50 hover:bg-surface/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProject || !projectName.trim()}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded font-label text-xs uppercase tracking-widest hover:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {creatingProject ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {projects.length === 0 && !loading && (
          <p className="text-sm text-surface/40">No projects yet. Create one to start curating products for this client.</p>
        )}

        {projects.length > 0 && (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between bg-surface/5 rounded-lg p-5 hover:bg-surface/8 transition-colors">
                <div>
                  <h4 className="font-headline text-lg text-surface">{project.name}</h4>
                  <div className="mt-1 flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status] || "bg-surface/10 text-surface/50"}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    <span className="text-xs text-surface/30">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link href={`/projects/${project.id}`} className="font-label text-xs uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors">
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
