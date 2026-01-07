"use client"

import { adminApi } from "@/lib/api"
import { FileText, HelpCircle, Info, Save, Shield } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AdminCMSPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'faq' | 'about'>('privacy')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await adminApi.getSettings()
      setSettings(data || {})
    } catch (error) {
      toast.error("Failed to load content")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.updateSettings(settings)
      toast.success("Content saved successfully")
    } catch (error) {
      toast.error("Failed to save content")
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, key: 'privacy_policy' },
    { id: 'terms', label: 'Terms of Service', icon: FileText, key: 'terms_of_service' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, key: 'faq_content' },
    { id: 'about', label: 'About Us', icon: Info, key: 'about_us' },
  ]

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            Content Management
          </h1>
          <p className="text-slate-500 text-sm">Manage legal documents and static pages.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-medium text-slate-900 dark:text-white text-sm">Pages</h3>
            </div>
            <div className="p-2 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="font-medium text-slate-900 dark:text-white">
                Editing: {tabs.find(t => t.id === activeTab)?.label}
              </span>
              <span className="text-xs text-slate-500">Supports Markdown / HTML</span>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={settings[tabs.find(t => t.id === activeTab)?.key || ''] || ''}
                onChange={(e) => handleChange(tabs.find(t => t.id === activeTab)?.key || '', e.target.value)}
                className="absolute inset-0 w-full h-full p-6 resize-none bg-transparent outline-none text-slate-800 dark:text-slate-200 font-mono text-sm leading-relaxed"
                placeholder="Enter content here..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
