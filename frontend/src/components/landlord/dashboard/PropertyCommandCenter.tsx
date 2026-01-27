import { PropertySeatSummary, SeatDto } from "@/types/auth"
import { Bed, MapPin, MessageSquare, Power, Star, Users } from "lucide-react"
import { useState } from "react"

interface PropertyCommandCenterProps {
    title?: string
    properties: PropertySeatSummary[]
    onToggleSeat: (seatId: number) => void
}

export const PropertyCommandCenter = ({ title = "Property Command Center", properties, onToggleSeat }: PropertyCommandCenterProps) => {
    const [expandedPropertyId, setExpandedPropertyId] = useState<number | null>(null)

    const getSeatColor = (seat: SeatDto) => {
        if (seat.isOccupiedByBooking) return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
        if (seat.status === "BLOCKED") return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
        if (seat.status === "MAINTENANCE") return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
    }

    const getSeatStatusLabel = (seat: SeatDto) => {
        if (seat.isOccupiedByBooking) return "Occupied"
        return seat.status.charAt(0) + seat.status.slice(1).toLowerCase()
    }

    const toggleReviews = (id: number) => {
        if (expandedPropertyId === id) {
            setExpandedPropertyId(null)
        } else {
            setExpandedPropertyId(id)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Bed className="w-5 h-5" /> {title}
            </h3>

            <div className="grid grid-cols-1 gap-6">
                {properties.map((property) => (
                    <div key={property.id} className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm flex flex-col">
                        <div className="flex flex-col md:flex-row">
                            {/* Property Image & Info */}
                            <div
                                className="w-full md:w-1/3 min-h-[200px] bg-slate-100 relative group cursor-pointer"
                                onClick={() => toggleReviews(property.id)}
                            >
                                <img
                                    src={property.imageUrl || "/placeholder-property.jpg"}
                                    alt={property.title}
                                    className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="text-white font-bold text-lg truncate shadow-sm">{property.title}</h4>
                                            <div className="text-white/90 text-sm flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {property.address}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit
                                        ${property.status === 'Booked'
                                            ? 'bg-rose-500/90 text-white'
                                            : 'bg-emerald-500/90 text-white'}`}
                                    >
                                        {property.status || 'Vacant'}
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {property.reviews ? property.reviews.length : 0} Reviews
                                </div>
                            </div>

                            {/* Seat Grid */}
                            <div className="flex-1 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                            <Users className="w-4 h-4" />
                                            {property.occupiedBeds} / {property.totalBeds} Occupied
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                            {property.availableBeds} Available
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 italic">Click available seats to block</div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {property.seats.map((seat) => (
                                        <div
                                            key={seat.id}
                                            onClick={() => {
                                                if (!seat.isOccupiedByBooking) {
                                                    onToggleSeat(seat.id)
                                                }
                                            }}
                                            className={`
                                                aspect-square rounded-lg border-2 flex flex-col justify-center items-center p-2 transition-all relative
                                                ${getSeatColor(seat)}
                                            `}
                                            title={getSeatStatusLabel(seat)}
                                        >
                                            <Bed className="w-5 h-5 mb-1 opacity-80" />
                                            <span className="text-xs font-bold text-center leading-tight">
                                                {seat.label.replace("Bed ", "")}
                                            </span>
                                            <span className="text-[10px] uppercase font-semibold mt-1 opacity-75">
                                                {getSeatStatusLabel(seat)}
                                            </span>

                                            {seat.status === "BLOCKED" && (
                                                <div className="absolute top-1 right-1">
                                                    <Power className="w-3 h-3 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {property.seats.length === 0 && (
                                        <div className="col-span-full py-8 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300">
                                            No seat configuration found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section (Expandable) */}
                        {expandedPropertyId === property.id && (
                            <div className="border-t border-slate-100 dark:border-dark-700 bg-slate-50 dark:bg-dark-900/50 p-6 animate-in slide-in-from-top-2">
                                <h5 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    Resident Reviews ({property.reviews ? property.reviews.length : 0})
                                </h5>

                                {property.reviews && property.reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {property.reviews.map((review) => (
                                            <div key={review.id} className="bg-white dark:bg-dark-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-dark-700">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={review.authorAvatar || "/placeholder-user.jpg"}
                                                            alt={review.authorName}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white text-sm">{review.authorName}</div>
                                                            <div className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-amber-600 dark:text-amber-400 text-xs font-bold">
                                                        <Star className="w-3 h-3 mr-1 fill-current" /> {review.rating}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm pl-11">"{review.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 text-sm italic">
                                        No reviews yet for this property.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
