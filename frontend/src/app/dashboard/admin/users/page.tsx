"use client"

import { DeletionWarningModal } from "@/components/admin/DeletionWarningModal"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { useDebounce } from "@/hooks/useDebounce"
import { adminApi } from "@/lib/api"
import { User } from "@/types/auth"
import {
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    Edit,
    Loader2,
    Mail,
    MapPin,
    Plus,
    Search,
    Trash2,
    Undo2,
    Users,
    X,
    XCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function UserManagementPage() {
    const router = useRouter()
    const { isDark } = useTheme()
    const { user: currentUser } = useAuth()

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    // Deletion Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roles: [] as string[],
        enabled: true,
        gender: "PREFER_NOT_TO_SAY",
        seekingMode: "ROOM",
        emailNotifications: true,
        pushNotifications: true
    })

    const debouncedSearch = useDebounce(searchTerm, 500)

    useEffect(() => {
        fetchUsers(true)
    }, [debouncedSearch])

    const fetchUsers = async (reset: boolean = false) => {
        if (reset) {
            setLoading(true)
            setPage(0)
        } else {
            setIsLoadingMore(true)
        }

        try {
            const currentPage = reset ? 0 : page
            const data = await adminApi.getAllUsers(currentPage, 20, debouncedSearch)

            if (reset) {
                setUsers(data.content)
            } else {
                setUsers(prev => {
                    const existingIds = new Set(prev.map(u => u.id))
                    const newUsers = data.content.filter(u => !existingIds.has(u.id))
                    return [...prev, ...newUsers]
                })
            }

            setTotalPages(data.totalPages)
            if (!reset) setPage(currentPage + 1)

        } catch (error) {
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
            setIsLoadingMore(false)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await adminApi.createUser(formData)
            toast.success("User created successfully")
            setShowCreateModal(false)
            fetchUsers(true)
        } catch (error) {
            toast.error("Failed to create user")
        }
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser) return
        try {
            await adminApi.updateUser(selectedUser.id, formData)
            toast.success("User updated successfully")
            setShowEditModal(false)
            fetchUsers(true)
        } catch (error) {
            toast.error("Failed to update user")
        }
    }

    // New Deletion Handlers
    const handleScheduleDeletion = async (reason: string) => {
        if (!userToDelete) return
        try {
            await adminApi.scheduleDeletion(userToDelete.id, reason)
            toast.success("Account scheduled for deletion")
            setShowDeleteModal(false)
            fetchUsers(true)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to schedule deletion")
        }
    }

    const handleCancelDeletion = async (id: number) => {
        if (!confirm("Restore this account to active status?")) return
        try {
            await adminApi.cancelDeletion(id)
            toast.success("Deletion cancelled. Account restored.")
            fetchUsers(true)
        } catch (error) {
            toast.error("Failed to cancel deletion")
        }
    }

    const handleBanUser = async (user: User) => {
        if (!confirm(`Are you sure you want to BAN ${user.firstName}?`)) return
        try {
            await adminApi.updateUserStatus(user.id, "BANNED")
            toast.success("User banned")
            fetchUsers(true)
        } catch (error) {
            toast.error("Failed to ban user")
        }
    }

    const handleWarnUser = async (user: User) => {
        if (!confirm(`Issue a warning to ${user.firstName}?`)) return
        try {
            await adminApi.updateUserStatus(user.id, "WARNING")
            toast.success("User warned")
            fetchUsers(true)
        } catch (error) {
            toast.error("Failed to warn user")
        }
    }

    const handleActivateUser = async (user: User) => {
        try {
            await adminApi.updateUserStatus(user.id, "ACTIVE")
            toast.success("User activated")
            fetchUsers(true)
        } catch (error) {
            toast.error("Failed to activate user")
        }
    }

    const confirmDelete = (user: User) => {
        setUserToDelete(user)
        setShowDeleteModal(true)
    }

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user immediately? (Legacy Delete)")) return
        try {
            await adminApi.deleteUser(id)
            toast.success("User deleted successfully")
            setUsers(prev => prev.filter(u => u.id !== id))
        } catch (error) {
            toast.error("Failed to delete user")
        }
    }

    const openEditModal = (user: User) => {
        setSelectedUser(user)
        setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            password: "",
            roles: user.roles || [],
            enabled: user.enabled,
            gender: user.gender || "PREFER_NOT_TO_SAY",
            seekingMode: user.seekingMode || "ROOM",
            emailNotifications: user.emailNotifications ?? true,
            pushNotifications: user.pushNotifications ?? true
        })
        setShowEditModal(true)
    }

    const loadMore = () => {
        if (page < totalPages - 1) {
            fetchUsers(false)
        }
    }

    if (loading && users.length === 0) {
        return (

            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-primary-400" : "text-primary-600"}`} />
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading users...</p>
                </div>
            </div>

        )
    }

    return (
        <>
            <div className={`h-[calc(100vh-120px)] flex flex-col rounded-xl overflow-hidden border ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-slate-200"}`}>

                {/* Header Section */}
                <div className={`flex-shrink-0 border-b ${isDark ? "border-dark-700" : "border-slate-200"}`}>
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>User Management</h1>
                            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Manage system users, roles, and permissions
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 md:w-64">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-colors outline-none border ${isDark
                                        ? "bg-dark-950 border-white/10 text-white placeholder-slate-600 focus:border-primary-500/50"
                                        : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary-500"
                                        }`}
                                />
                            </div>

                            <button
                                onClick={() => {
                                    setFormData({ firstName: "", lastName: "", email: "", password: "", roles: ["ROLE_USER"], enabled: true, gender: "PREFER_NOT_TO_SAY", seekingMode: "ROOM", emailNotifications: true, pushNotifications: true })
                                    setShowCreateModal(true)
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-600 hover:bg-primary-700"}`}
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add User</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className={`flex-1 overflow-y-auto ${isDark ? "bg-dark-900" : "bg-slate-50"}`}>
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-dark-800" : "bg-white"}`}>
                                <Users className={`w-8 h-8 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>No users found</h3>
                            <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                {searchTerm ? "Try adjusting your search terms" : "Get started by adding a new user"}
                            </p>
                        </div>
                    ) : (
                        <div className="p-0">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className={`group flex items-start gap-4 p-4 border-b transition-colors ${isDark ? "border-dark-800 bg-dark-900 hover:bg-dark-800/80" : "border-slate-100 bg-white hover:bg-slate-50"
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${isDark ? "bg-dark-800 border-dark-700 text-slate-300" : "bg-primary-50 border-primary-100 text-primary-600"
                                        }`}>
                                        {user.profilePictureUrl ? (
                                            <img src={user.profilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <span className="font-semibold text-sm">{user.firstName?.[0] || user.email[0].toUpperCase()}</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                                                        {user.firstName} {user.lastName}
                                                        {user.id === currentUser?.id && <span className="ml-2 text-xs text-primary-500">(You)</span>}
                                                    </h3>
                                                    {user.roles.map(role => (
                                                        <span key={role} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${role === "ROLE_ADMIN"
                                                            ? (isDark ? "bg-red-900/30 text-red-400 border border-red-900/50" : "bg-red-100 text-red-700")
                                                            : role === "ROLE_HOUSE_OWNER"
                                                                ? (isDark ? "bg-blue-900/30 text-blue-400 border border-blue-900/50" : "bg-blue-100 text-blue-700")
                                                                : (isDark ? "bg-dark-800 text-slate-400 border border-dark-700" : "bg-slate-100 text-slate-600")
                                                            }`}>
                                                            {role.replace("ROLE_", "")}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-sm">
                                                    <div className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {user.email}
                                                    </div>
                                                    {user.city && (
                                                        <div className={`flex items-center gap-1.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {user.city}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge & Actions */}
                                            <div className="flex items-center gap-2">
                                                {user.accountStatus === "PENDING_DELETION" ? (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isDark ? "text-amber-400 bg-amber-900/30 border border-amber-900/50" : "text-amber-700 bg-amber-50"}`}>
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Pending Deletion
                                                    </div>
                                                ) : (
                                                    <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${user.accountStatus === 'BANNED' ? 'text-red-700 bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900' :
                                                        user.accountStatus === 'WARNING' ? 'text-amber-700 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900' :
                                                            user.accountStatus === 'SUSPENDED' ? 'text-orange-700 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900' :
                                                                user.enabled
                                                                    ? (isDark ? "text-emerald-400 bg-emerald-950/50 border-emerald-900" : "text-emerald-700 bg-emerald-50 border-emerald-200")
                                                                    : (isDark ? "text-red-400 bg-red-950/50 border-red-900" : "text-red-700 bg-red-50 border-red-200")
                                                        }`}>
                                                        {user.accountStatus === 'BANNED' ? <XCircle className="w-3 h-3" /> :
                                                            user.accountStatus === 'WARNING' ? <AlertTriangle className="w-3 h-3" /> :
                                                                user.enabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {user.accountStatus === 'BANNED' ? "Banned" :
                                                            user.accountStatus === 'WARNING' ? "Warning" :
                                                                user.accountStatus === 'SUSPENDED' ? "Suspended" :
                                                                    user.enabled ? "Active" : "Disabled"}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className={`p-1.5 rounded transition-colors ${isDark ? "hover:bg-dark-750 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-900"}`}
                                                        title="Edit User"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>

                                                    {user.accountStatus === "PENDING_DELETION" ? (
                                                        <button
                                                            onClick={() => handleCancelDeletion(user.id)}
                                                            className={`p-1.5 rounded transition-colors ${isDark ? "hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-400" : "hover:bg-emerald-100 text-slate-500 hover:text-emerald-600"}`}
                                                            title="Cancel Deletion"
                                                        >
                                                            <Undo2 className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        currentUser?.id !== user.id && (
                                                            <button
                                                                onClick={() => confirmDelete(user)}
                                                                className={`p-1.5 rounded transition-colors ${isDark ? "hover:bg-red-900/30 text-slate-400 hover:text-red-400" : "hover:bg-red-100 text-slate-500 hover:text-red-600"}`}
                                                                title="Schedule Deletion"
                                                                disabled={user.roles.includes("ROLE_ADMIN")}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )
                                                    )}

                                                    {user.accountStatus !== 'BANNED' && (
                                                        <button
                                                            onClick={() => handleBanUser(user)}
                                                            className={`p-1.5 rounded transition-colors ${isDark ? "hover:bg-red-900/30 text-slate-400 hover:text-red-400" : "hover:bg-red-100 text-slate-500 hover:text-red-600"}`}
                                                            title="Ban User"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {user.accountStatus === 'BANNED' && (
                                                        <button
                                                            onClick={() => handleActivateUser(user)}
                                                            className={`p-1.5 rounded transition-colors ${isDark ? "hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-400" : "hover:bg-emerald-100 text-slate-500 hover:text-emerald-600"}`}
                                                            title="Activate User"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {page < totalPages - 1 && (
                        <div className="flex justify-center py-6">
                            <button
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? "bg-dark-800 text-slate-400 hover:bg-dark-750 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                    }`}
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        Load more
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? "bg-dark-800 border border-white/10" : "bg-white"}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {showCreateModal ? "Add New User" : "Edit User"}
                            </h2>
                            <button
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false) }}
                                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={showCreateModal ? handleCreateUser : handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>First Name</label>
                                    <input
                                        required
                                        type="text"
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark
                                            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white"
                                            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
                                            }`}
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark
                                            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white"
                                            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
                                            }`}
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark
                                        ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white disabled:opacity-50"
                                        : "bg-white border-slate-200 focus:border-primary-500 text-slate-900 disabled:bg-slate-50"
                                        }`}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    disabled={showEditModal}
                                />
                            </div>

                            {showCreateModal && (
                                <div className="space-y-1.5">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Password</label>
                                    <input
                                        required
                                        type="password"
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark
                                            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white"
                                            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
                                            }`}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Roles</label>
                                <div className="flex flex-wrap gap-2">
                                    {["ROLE_USER", "ROLE_HOUSE_OWNER", "ROLE_ADMIN"].map(role => (
                                        <label
                                            key={role}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${formData.roles.includes(role)
                                                ? (isDark ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-primary-50 border-primary-500 text-primary-700")
                                                : (isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-50")
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.roles.includes(role)}
                                                onChange={e => {
                                                    const newRoles = e.target.checked
                                                        ? [...formData.roles, role]
                                                        : formData.roles.filter(r => r !== role)
                                                    setFormData({ ...formData, roles: newRoles })
                                                }}
                                            />
                                            <span className="text-sm font-medium">{role.replace("ROLE_", "").replace("_", " ")}</span>
                                            {formData.roles.includes(role) && <CheckCircle className="w-4 h-4" />}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Gender</label>
                                    <select
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark
                                            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white"
                                            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
                                            }`}
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="NON_BINARY">Non-binary</option>
                                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Seeking Mode</label>
                                    <select
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark
                                            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white"
                                            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
                                            }`}
                                        value={formData.seekingMode}
                                        onChange={e => setFormData({ ...formData, seekingMode: e.target.value })}
                                    >
                                        <option value="ROOM">Room</option>
                                        <option value="ROOMMATE">Roommate</option>
                                        <option value="BOTH">Both</option>
                                        <option value="NONE">None</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                                    <input
                                        type="checkbox"
                                        id="emailNotifications"
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        checked={formData.emailNotifications}
                                        onChange={e => setFormData({ ...formData, emailNotifications: e.target.checked })}
                                    />
                                    <label htmlFor="emailNotifications" className={`text-sm font-medium cursor-pointer ${isDark ? "text-white" : "text-slate-900"}`}>
                                        Email Alerts
                                    </label>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                                    <input
                                        type="checkbox"
                                        id="pushNotifications"
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        checked={formData.pushNotifications}
                                        onChange={e => setFormData({ ...formData, pushNotifications: e.target.checked })}
                                    />
                                    <label htmlFor="pushNotifications" className={`text-sm font-medium cursor-pointer ${isDark ? "text-white" : "text-slate-900"}`}>
                                        Push Alerts
                                    </label>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                                <input
                                    type="checkbox"
                                    id="enabled"
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.enabled}
                                    onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                                />
                                <label htmlFor="enabled" className={`text-sm font-medium cursor-pointer ${isDark ? "text-white" : "text-slate-900"}`}>
                                    Enabled Account
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); setShowEditModal(false) }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-lg shadow-primary-500/20 ${isDark ? "bg-primary-500 hover:bg-primary-600" : "bg-primary-600 hover:bg-primary-700"
                                        }`}
                                >
                                    {showCreateModal ? "Create User" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeletionWarningModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleScheduleDeletion}
                userName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : ""}
            />
        </>
    )
}
