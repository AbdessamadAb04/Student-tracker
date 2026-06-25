import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { mockGroups } from '../../data/mockData'

type Mode = 'signin' | 'signup'

export default function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [groupId, setGroupId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Supabase: fetch real groups; demo: use mockGroups
  const [availableGroups, setAvailableGroups] = useState<{ id: string; name: string }[]>(mockGroups)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAvailableGroups(mockGroups)
      return
    }
    supabase.from('groups').select('id, name').order('name').then(({ data }) => {
      if (data && data.length > 0) setAvailableGroups(data)
    })
  }, [])

  // Pre-select first group when role is student
  useEffect(() => {
    if (role === 'student' && availableGroups.length > 0 && !groupId) {
      setGroupId(availableGroups[0].id)
    }
    if (role === 'teacher') setGroupId('')
  }, [role, availableGroups])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    let result: { error: string | null }
    if (mode === 'signup') {
      if (!name.trim()) { setError('Le nom est requis'); setLoading(false); return }
      if (role === 'student' && !groupId) { setError('Veuillez sélectionner un groupe'); setLoading(false); return }
      result = await signUp(email, password, name, role, role === 'student' ? groupId : undefined)
      if (!result.error) setSuccess(true)
    } else {
      result = await signIn(email, password)
    }

    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] mb-4">
            <span className="text-2xl text-white font-bold">E</span>
          </div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">EduTrack</h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Votre espace académique personnel</p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex rounded-xl bg-[var(--color-gray-bg)] p-1 mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 rounded-lg py-2 text-[var(--text-sm)] font-medium transition-all ${
                  mode === m
                    ? 'bg-[var(--color-white)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                {m === 'signin' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center h-14 w-14 mx-auto mb-4 rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-1">Compte créé !</h3>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                Vérifiez votre email pour confirmer votre compte, puis connectez-vous.
              </p>
              <button onClick={() => { setMode('signin'); setSuccess(false) }} className="mt-4 text-[var(--text-sm)] text-[var(--color-primary)] hover:underline">
                Se connecter
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  {/* Full name */}
                  <div>
                    <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Nom complet</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Abdessamad Abounouh"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  {/* Role selector — card style */}
                  <div>
                    <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-2">Rôle</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: 'student' as const, label: 'Étudiant', desc: 'Suivi personnel', icon: 'M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zm0-3a3 3 0 100-6 3 3 0 000 6z' },
                        { value: 'teacher' as const, label: 'Enseignant', desc: 'Gestion de classe', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                      ]).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRole(opt.value)}
                          className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all ${
                            role === opt.value
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40'
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.icon} />
                          </svg>
                          <span className="text-xs font-semibold">{opt.label}</span>
                          <span className="text-[10px] opacity-70">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group selector — students only */}
                  {role === 'student' && (
                    <div>
                      <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Groupe / Classe</label>
                      <div className="space-y-1.5">
                        {availableGroups.map(g => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setGroupId(g.id)}
                            className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                              groupId === g.id
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
                            }`}
                          >
                            <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              groupId === g.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-gray-bg)] text-[var(--color-text-secondary)]'
                            }`}>
                              {g.name.charAt(0)}
                            </span>
                            <span className={`text-xs font-medium ${groupId === g.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                              {g.name}
                            </span>
                            {groupId === g.id && (
                              <svg className="h-4 w-4 ml-auto text-[var(--color-primary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="email@exemple.com"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[var(--text-xs)] text-red-700">
                  <p className="font-semibold">{error}</p>
                  {error.toLowerCase().includes('rate limit') && (
                    <div className="mt-2.5 pt-2.5 border-t border-red-200/60 text-left text-red-800 space-y-1.5">
                      <p className="font-semibold text-red-900 flex items-center gap-1">
                        <span>💡</span> Comment résoudre cela sur votre projet Supabase :
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-red-700 leading-relaxed">
                        <li>Allez sur le <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-red-900 transition-colors">Tableau de bord Supabase</a></li>
                        <li>Sélectionnez votre projet (<strong>hmkwpkxynfqjkukdjikn</strong>)</li>
                        <li>Dans le menu de gauche, allez dans <strong>Authentication</strong> &gt; <strong>Providers</strong> &gt; <strong>Email</strong></li>
                        <li>Décochez/désactivez l'option <strong>Confirm email</strong></li>
                        <li>Cliquez sur <strong>Save</strong> (Enregistrer)</li>
                      </ol>
                      <p className="text-[10px] text-red-600/80 italic leading-snug">
                        Cela empêchera Supabase d'envoyer un mail de vérification, créera le compte instantanément et vous connectera automatiquement.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--color-primary)] py-2.5 text-[var(--text-sm)] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : 'Créer un compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
