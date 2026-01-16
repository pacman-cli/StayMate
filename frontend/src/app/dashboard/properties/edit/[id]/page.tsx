"use client"

import { propertyApi } from "@/lib/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  MapPin,
  UploadCloud,
  X
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Script from "next/script"
import React, { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import { z } from "zod"

// --- Constants & Schemas ---

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  propertyType: z.enum(["APARTMENT", "HOUSE", "ROOM", "STUDIO"] as const, {
    message: "Please select a property type",
  }),
  price: z.number({ message: "Rent must be a number" }).positive("Rent must be positive"),
  beds: z.number().int().positive().max(20),
  baths: z.number().int().positive().max(20),
  area: z.number().positive("Area must be positive"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  files: z.array(z.any()).optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

const steps = [
  { id: 'basic', title: 'Basic Info', icon: Building },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'details', title: 'Details', icon: CheckCircle2 },
  { id: 'media', title: 'Photos', icon: ImageIcon },
]

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    mode: "onChange",
  })

  // Load existing property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return

      try {
        const property = await propertyApi.getProperty(Number(propertyId))

        reset({
          title: property.title || "",
          description: property.description || "",
          propertyType: property.propertyType || "APARTMENT",
          price: property.priceAmount || 0,
          beds: property.beds || 1,
          baths: property.baths || 1,
          area: property.sqft || 0,
          address: property.location || "",
          city: property.city || "",
          zipCode: property.zipCode || "",
          latitude: property.latitude,
          longitude: property.longitude,
          files: [],
        })

        if (property.imageUrl) {
          setExistingImageUrl(property.imageUrl)
        }

        // Set address value for autocomplete
        setAddressValue(property.location || "")
      } catch (error) {
        console.error("Failed to fetch property", error)
        toast.error("Failed to load property")
        router.push("/dashboard/properties")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId, reset, router])

  // --- Google Places Autocomplete ---
  const {
    ready,
    value: addressValue,
    suggestions: { status: suggestionsStatus, data: suggestionsData },
    setValue: setAddressValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
  })

  const handleSelectAddress = async (address: string) => {
    setAddressValue(address, false)
    clearSuggestions()

    try {
      const results = await getGeocode({ address })
      const { lat, lng } = await getLatLng(results[0])

      setValue("address", address, { shouldValidate: true })
      setValue("latitude", lat)
      setValue("longitude", lng)

      results[0].address_components.forEach((component: any) => {
        if (component.types.includes("locality")) setValue("city", component.long_name, { shouldValidate: true })
        if (component.types.includes("postal_code")) setValue("zipCode", component.long_name, { shouldValidate: true })
      })
    } catch (error) {
      console.error("Error: ", error)
      toast.error("Could not fetch location details")
    }
  }

  // --- File Upload ---
  const onDrop = (acceptedFiles: File[]) => {
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviews])

    const currentFiles = watch("files") || []
    setValue("files", [...currentFiles, ...acceptedFiles], { shouldValidate: true })
  }

  const removeFile = (index: number) => {
    const currentFiles = watch("files") || []
    const newFiles = currentFiles.filter((_, i) => i !== index)
    setValue("files", newFiles, { shouldValidate: true })

    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: MAX_FILE_SIZE,
  })

  // --- Form Submission ---
  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true)
    try {
      const { files, ...jsonData } = data

      await propertyApi.updateProperty(Number(propertyId), {
        ...jsonData,
        amenities: []
      }, files || [])

      toast.success("Property updated successfully!")
      router.push("/dashboard/properties")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update property. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors)
    toast.error("Please check the form for errors.")
  }

  // --- Step Navigation ---
  const nextStep = async () => {
    let valid = false

    if (currentStep === 0) valid = await trigger(["title", "description", "propertyType"])
    if (currentStep === 1) valid = await trigger(["address", "city", "zipCode"])
    if (currentStep === 2) valid = await trigger(["price", "area", "beds", "baths"])
    if (currentStep === 3) valid = true // Files are optional for edit

    if (valid) setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => console.log("Google Maps loaded")}
      />

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Edit Property
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Update your property listing details.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-8 flex flex-wrap gap-4 justify-between items-center relative overflow-hidden">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 dark:bg-slate-700 -z-0 -translate-y-1/2 hidden md:block" />

          {steps.map((step, idx) => {
            const isActive = idx === currentStep
            const isCompleted = idx < currentStep
            return (
              <div key={step.id} className="relative z-10 flex items-center md:flex-col gap-3 md:gap-2 flex-1 md:flex-none">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <form className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px] flex flex-col">
          <div className="flex-1 p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >

                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <FormInput
                      label="Property Title"
                      error={errors.title?.message}
                      placeholder="e.g. Modern Apartment in Downtown"
                      {...register("title")}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormSelect
                        label="Property Type"
                        error={errors.propertyType?.message}
                        {...register("propertyType")}
                      >
                        <option value="">Select Type</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="HOUSE">House</option>
                        <option value="ROOM">Private Room</option>
                        <option value="STUDIO">Studio</option>
                      </FormSelect>
                    </div>

                    <FormTextarea
                      label="Description"
                      error={errors.description?.message}
                      placeholder="Describe your property..."
                      rows={6}
                      {...register("description")}
                    />
                  </div>
                )}

                {/* Step 2: Location */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="relative z-50">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Detailed Address
                      </label>
                      <input
                        value={addressValue}
                        onChange={(e) => {
                          setAddressValue(e.target.value)
                          setValue("address", e.target.value, { shouldValidate: true })
                        }}
                        placeholder="Start typing address..."
                        className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
                      />
                      {suggestionsStatus === "OK" && (
                        <ul className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-auto z-50 py-2">
                          {suggestionsData.map(({ place_id, description }) => (
                            <li
                              key={place_id}
                              onClick={() => handleSelectAddress(description)}
                              className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
                            >
                              {description}
                            </li>
                          ))}
                        </ul>
                      )}
                      {errors.address && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.address.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput label="City" placeholder="City" error={errors.city?.message} {...register("city")} />
                      <FormInput label="Zip Code" placeholder="Zip Code" error={errors.zipCode?.message} {...register("zipCode")} />
                    </div>
                  </div>
                )}

                {/* Step 3: Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <FormInput
                      label="Monthly Rent (BDT)"
                      type="number"
                      error={errors.price?.message}
                      {...register("price", { valueAsNumber: true })}
                    />

                    <div className="grid grid-cols-3 gap-6">
                      <FormInput label="Beds" type="number" error={errors.beds?.message} {...register("beds", { valueAsNumber: true })} />
                      <FormInput label="Baths" type="number" error={errors.baths?.message} {...register("baths", { valueAsNumber: true })} />
                      <FormInput label="Area (sq ft)" type="number" error={errors.area?.message} {...register("area", { valueAsNumber: true })} />
                    </div>
                  </div>
                )}

                {/* Step 4: Media */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {existingImageUrl && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Image</label>
                        <div className="w-48 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                          <img src={existingImageUrl} alt="Current" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
                          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}
                    >
                      <input {...getInputProps()} />
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                        Upload new images (optional)
                      </p>
                      <p className="text-sm text-slate-500 mt-2">PNG, JPG or WEBP (max. 5MB)</p>
                    </div>

                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {previewUrls.map((url, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between bg-slate-50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors
                    ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit(onSubmit, onError)}
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 flex items-center gap-2 shadow-lg"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// --- Reusable UI Components ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const FormInput = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
    <div className="relative">
      <input
        ref={ref}
        className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all
          ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'} ${className}`}
        {...props}
      />
      {error && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"><AlertCircle className="w-4 h-4" /></div>}
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
FormInput.displayName = "FormInput"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

const FormSelect = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, error, children, className, ...props }, ref) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
    <div className="relative">
      <select
        ref={ref}
        className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all
          ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
        <ChevronRight className="w-4 h-4 rotate-90" />
      </div>
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
FormSelect.displayName = "FormSelect"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
    <textarea
      ref={ref}
      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none
        ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
FormTextarea.displayName = "FormTextarea"
