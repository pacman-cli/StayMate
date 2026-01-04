// Landing page data constants
// Extracted from page.tsx to improve maintainability

import {
    AlertTriangle,
    Award,
    Bed,
    Brain,
    Briefcase,
    Building,
    Building2,
    Car,
    Clock,
    Coffee,
    Dumbbell,
    Globe,
    GraduationCap,
    Headphones,
    HelpCircle,
    Home,
    Lock,
    MapPinned,
    MessageCircle,
    MessageSquare,
    Search,
    Shield,
    ShieldCheck,
    Star,
    TreePine,
    Users,
    UsersRound,
    Wifi,
    XCircle,
    Zap
} from "lucide-react"
import { ReactNode } from "react"

export interface Problem {
    icon: ReactNode
    title: string
    description: string
    color: string
}

export interface CoreFeature {
    icon: ReactNode
    title: string
    description: string
    benefits: string[]
    color: string
    details: string[]
}

export interface Stat {
    value: string
    label: string
    icon: ReactNode
    suffix: string
}

export interface Testimonial {
    quote: string
    author: string
    role: string
    location: string
    avatar: string
    rating: number
    verified: boolean
}

export interface HowItWorksStep {
    step: string
    title: string
    description: string
    icon: ReactNode
    details: string[]
}

export interface UserType {
    icon: ReactNode
    title: string
    description: string
    benefits: string[]
    color: string
}

export interface Amenity {
    icon: ReactNode
    label: string
}

export interface FAQ {
    question: string
    answer: string
}

export interface TrustedByItem {
    name: string
    icon: ReactNode
}

// Problem Statement Data
export const problems: Problem[] = [
    {
        icon: <AlertTriangle className="w-6 h-6" />,
        title: "Fake Rental Ads",
        description:
            "Scammers post fake listings to steal deposits and personal information from unsuspecting renters.",
        color: "red",
    },
    {
        icon: <XCircle className="w-6 h-6" />,
        title: "Unverified Landlords & Tenants",
        description:
            "No way to verify if the person you're dealing with is legitimate, leading to trust issues.",
        color: "orange",
    },
    {
        icon: <HelpCircle className="w-6 h-6" />,
        title: "No Clarity on Costs",
        description:
            "Hidden charges, unclear utility costs, and surprise fees make budgeting impossible.",
        color: "yellow",
    },
    {
        icon: <MessageSquare className="w-6 h-6" />,
        title: "Difficult Communication",
        description:
            "No streamlined way to communicate between owners and tenants, leading to miscommunication.",
        color: "purple",
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: "No Roommate Matching",
        description:
            "Finding compatible roommates based on lifestyle is nearly impossible with traditional methods.",
        color: "blue",
    },
    {
        icon: <Clock className="w-6 h-6" />,
        title: "Time-Consuming Search",
        description:
            "Searching across multiple platforms wastes hours with no guarantee of finding suitable options.",
        color: "cyan",
    },
]

// Core Features with detailed information
export const coreFeatures: CoreFeature[] = [
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Verified Rental Listings",
        description:
            "Landlords can post rooms with verified rental details including photos, rent & utility costs, location maps, owner identity verification, and security deposit information.",
        benefits: [
            "Eliminates fake ads",
            "Builds trust",
            "Complete transparency",
        ],
        color: "primary",
        details: [
            "Room photos & virtual tours",
            "Rent & utility cost breakdown",
            "Interactive location map",
            "Owner identity verification",
            "Security deposit info",
        ],
    },
    {
        icon: <UsersRound className="w-8 h-8" />,
        title: "Roommate Posting by Tenants",
        description:
            "Tenants can post when they need a roommate to share rent. Enter lifestyle preferences, add rent split & room details, and the system shows matched people.",
        benefits: [
            "Find genuine roommates",
            "No random notices",
            "Lifestyle matching",
        ],
        color: "purple",
        details: [
            "Post 'Roommate Needed' listings",
            "Set lifestyle preferences",
            "Define rent split details",
            "Get matched automatically",
            "Chat with interested users",
        ],
    },
    {
        icon: <Brain className="w-8 h-8" />,
        title: "AI-Based Compatibility Matching",
        description:
            "Smart AI algorithm matches users based on budget, location preference, personality traits, daily habits, college/office location, cleanliness level, and sleep schedule.",
        benefits: [
            "Compatibility percentage",
            "Smart suggestions",
            "Better living experience",
        ],
        color: "emerald",
        details: [
            "Budget matching",
            "Location preference",
            "Personality traits analysis",
            "Daily habits comparison",
            "Sleep schedule alignment",
        ],
    },
    {
        icon: <MapPinned className="w-8 h-8" />,
        title: "Smart Area-Based Search",
        description:
            "Search by area, budget, living type (single/shared), and gender preference. Perfect for targeting university and office zones with verified nearby rentals.",
        benefits: [
            "Targeted search",
            "Filter by preferences",
            "Find nearby options",
        ],
        color: "amber",
        details: [
            "Area-based filtering",
            "Budget range selection",
            "Living type preference",
            "Gender preference option",
            "University/Office zone targeting",
        ],
    },
    {
        icon: <MessageCircle className="w-8 h-8" />,
        title: "In-App Messaging + Visit Scheduling",
        description:
            "Secure chat system that avoids sharing phone numbers. Click 'Chat with Owner', send messages instantly, schedule visits, and get owner confirmations.",
        benefits: [
            "Privacy protected",
            "Instant messaging",
            "Easy scheduling",
        ],
        color: "rose",
        details: [
            "Secure in-app chat",
            "No phone number sharing",
            "Visit scheduling",
            "Owner confirmation system",
            "Message history",
        ],
    },
    {
        icon: <ShieldCheck className="w-8 h-8" />,
        title: "3-Level Verification System",
        description:
            "Comprehensive verification including NID/Student ID upload, phone & email verification, and address & occupation proof. Users get Verified, Partially Verified, or Not Verified badges.",
        benefits: ["Safety ensured", "Trust badges", "Fraud prevention"],
        color: "cyan",
        details: [
            "NID / Student ID upload",
            "Phone verification",
            "Email verification",
            "Address proof",
            "Occupation verification",
        ],
    },
    {
        icon: <Star className="w-8 h-8" />,
        title: "Review & Rating System",
        description:
            "Users can rate landlords, rooms, tenants, and roommates. Helps maintain transparency and prevents fraud through community feedback.",
        benefits: [
            "Community feedback",
            "Transparency",
            "Quality assurance",
        ],
        color: "yellow",
        details: [
            "Rate landlords",
            "Rate rooms",
            "Rate tenants",
            "Rate roommates",
            "Written reviews",
        ],
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Emergency Room Finder",
        description:
            "For students or job seekers who need instant accommodation. Select 'Emergency Room Needed', system shows urgent available rooms, and contact owner instantly.",
        benefits: [
            "Instant results",
            "Urgent availability",
            "Quick booking",
        ],
        color: "red",
        details: [
            "Emergency room tag",
            "Instant availability",
            "Quick contact",
            "Priority listing",
            "Fast response guarantee",
        ],
    },
]

// Stats
export const stats: Stat[] = [
    {
        value: "10K+",
        label: "Active Listings",
        icon: <Building className="w-5 h-5" />,
        suffix: "",
    },
    {
        value: "50K+",
        label: "Happy Users",
        icon: <Users className="w-5 h-5" />,
        suffix: "",
    },
    {
        value: "100+",
        label: "Cities Covered",
        icon: <Globe className="w-5 h-5" />,
        suffix: "",
    },
    {
        value: "4.9",
        label: "User Rating",
        icon: <Star className="w-5 h-5" />,
        suffix: "/5",
    },
    {
        value: "98%",
        label: "Verified Listings",
        icon: <ShieldCheck className="w-5 h-5" />,
        suffix: "",
    },
    {
        value: "24/7",
        label: "Support Available",
        icon: <Headphones className="w-5 h-5" />,
        suffix: "",
    },
]

// Testimonials
export const testimonials: Testimonial[] = [
    {
        quote: "As a university student, finding affordable accommodation was a nightmare. StayMate's AI matching helped me find the perfect roommate who shares my study schedule and lifestyle. We've been living together for 6 months now!",
        author: "Rahman Ahmed",
        role: "University Student",
        location: "Dhaka, Bangladesh",
        avatar: "RA",
        rating: 5,
        verified: true,
    },
    {
        quote: "I was skeptical about online room finding platforms after being scammed before. StayMate's 3-level verification gave me confidence. The landlord was verified, the room was exactly as shown, and the whole process was transparent.",
        author: "Fatima Khatun",
        role: "Job Seeker",
        location: "Chittagong, Bangladesh",
        avatar: "FK",
        rating: 5,
        verified: true,
    },
    {
        quote: "As a property owner, I've struggled with finding reliable tenants. StayMate's verification system and review system has helped me find trustworthy tenants. The in-app messaging makes communication so easy!",
        author: "Mohammad Karim",
        role: "Property Owner",
        location: "Sylhet, Bangladesh",
        avatar: "MK",
        rating: 5,
        verified: true,
    },
    {
        quote: "The emergency room finder feature was a lifesaver! I had to relocate for a new job with just 3 days notice. Found a verified room near my office within hours. Highly recommend for anyone in urgent need!",
        author: "Nusrat Jahan",
        role: "Software Developer",
        location: "Dhaka, Bangladesh",
        avatar: "NJ",
        rating: 5,
        verified: true,
    },
    {
        quote: "What sets StayMate apart is the roommate compatibility matching. It considers everything from sleep schedules to cleanliness preferences. My roommate and I get along perfectly because we were matched on these criteria.",
        author: "Tanvir Hassan",
        role: "Graduate Student",
        location: "Rajshahi, Bangladesh",
        avatar: "TH",
        rating: 5,
        verified: true,
    },
    {
        quote: "I've used many platforms to find tenants but StayMate is the best. The detailed listing options, verification badges, and the rating system help me attract quality tenants. My properties are always occupied!",
        author: "Salma Begum",
        role: "Real Estate Investor",
        location: "Dhaka, Bangladesh",
        avatar: "SB",
        rating: 5,
        verified: true,
    },
]

// How It Works - Detailed Steps
export const howItWorks: HowItWorksStep[] = [
    {
        step: "01",
        title: "Create Your Profile",
        description:
            "Sign up in seconds with email or phone. Complete your profile with preferences, lifestyle details, and verification documents for maximum trust.",
        icon: <Users className="w-8 h-8" />,
        details: [
            "Quick registration",
            "Add preferences",
            "Upload verification docs",
            "Set your budget",
        ],
    },
    {
        step: "02",
        title: "Search or Post Listings",
        description:
            "Browse verified rental listings or post your own. Use smart filters to find exactly what you need - by location, price, amenities, or roommate preferences.",
        icon: <Search className="w-8 h-8" />,
        details: [
            "Smart search filters",
            "Post your listing",
            "AI recommendations",
            "Save favorites",
        ],
    },
    {
        step: "03",
        title: "Connect & Communicate",
        description:
            "Found something interesting? Use our secure in-app messaging to connect with owners or potential roommates. Schedule visits directly through the platform.",
        icon: <MessageCircle className="w-8 h-8" />,
        details: [
            "Secure messaging",
            "Schedule visits",
            "Ask questions",
            "Negotiate terms",
        ],
    },
    {
        step: "04",
        title: "Verify & Review",
        description:
            "Check verification badges, read reviews from previous tenants or landlords. Make informed decisions based on community feedback and trust scores.",
        icon: <ShieldCheck className="w-8 h-8" />,
        details: [
            "Check badges",
            "Read reviews",
            "Verify identity",
            "Build trust",
        ],
    },
    {
        step: "05",
        title: "Move In & Rate",
        description:
            "Found your perfect match? Complete the process, move into your new home, and leave a review to help the community. Your feedback matters!",
        icon: <Home className="w-8 h-8" />,
        details: [
            "Finalize agreement",
            "Move in",
            "Leave review",
            "Help community",
        ],
    },
]

// User Types
export const userTypes: UserType[] = [
    {
        icon: <GraduationCap className="w-10 h-10" />,
        title: "Students",
        description:
            "Find affordable rooms near your university, compatible roommates who understand your study schedule, and verified safe accommodations.",
        benefits: [
            "Budget-friendly options",
            "Near campus locations",
            "Compatible roommates",
            "Student ID verification",
        ],
        color: "primary",
    },
    {
        icon: <Briefcase className="w-10 h-10" />,
        title: "Job Seekers",
        description:
            "Relocating for a new job? Find rooms near your workplace quickly with our emergency room finder and area-based search features.",
        benefits: [
            "Office zone search",
            "Quick availability",
            "Emergency finder",
            "Professional verification",
        ],
        color: "emerald",
    },
    {
        icon: <Building2 className="w-10 h-10" />,
        title: "Landlords",
        description:
            "List your properties with complete details, get verified tenant applications, and manage everything through our intuitive dashboard.",
        benefits: [
            "Verified tenants",
            "Easy listing management",
            "Secure payments",
            "Review system",
        ],
        color: "purple",
    },
    {
        icon: <UsersRound className="w-10 h-10" />,
        title: "Roommate Seekers",
        description:
            "Already have a place but need a roommate? Post your requirements and let our AI match you with compatible people.",
        benefits: [
            "AI compatibility matching",
            "Lifestyle preferences",
            "Split rent calculation",
            "Chat before meeting",
        ],
        color: "amber",
    },
]

// Amenities Filter Options
export const amenities: Amenity[] = [
    { icon: <Wifi className="w-5 h-5" />, label: "High-Speed WiFi" },
    { icon: <Car className="w-5 h-5" />, label: "Parking Space" },
    { icon: <Coffee className="w-5 h-5" />, label: "Near Cafes" },
    { icon: <TreePine className="w-5 h-5" />, label: "Garden Access" },
    { icon: <Dumbbell className="w-5 h-5" />, label: "Gym Nearby" },
    {
        icon: <Lock className="w-5 h-5" />, label: "24/7 Security" },
    { icon: <Bed className="w-5 h-5" />, label: "Furnished" },
    { icon: <Zap className="w-5 h-5" />, label: "Power Backup" },
]

// FAQ Data
export const faqs: FAQ[] = [
    {
        question: "How does StayMate verify listings and users?",
        answer: "StayMate uses a comprehensive 3-level verification system. Users can verify their identity through NID/Student ID upload, phone & email verification, and address & occupation proof. Listings are verified through property documents and owner identity checks. Users receive badges: Verified, Partially Verified, or Not Verified based on their verification level.",
    },
    {
        question: "How does the AI roommate matching work?",
        answer: "Our AI algorithm analyzes multiple factors including budget preferences, location requirements, personality traits, daily habits (like sleep schedule, cleanliness levels), and lifestyle choices. It then calculates a compatibility percentage and suggests potential roommates who match your criteria. This helps ensure you find someone you can actually live with harmoniously.",
    },
    {
        question: "Is StayMate free to use?",
        answer: "StayMate offers a free tier for basic features including browsing listings, creating a profile, and basic messaging. Premium features like priority listing placement, advanced AI matching, and emergency room finder may require a subscription. We're committed to keeping core features accessible, especially for students and job seekers.",
    },
    {
        question: "How is StayMate different from Airbnb?",
        answer: "While Airbnb focuses on short-term vacation rentals, StayMate is specifically designed for long-term stays (1-12+ months). We focus on verified, budget-friendly shared-living options, lifestyle-based roommate matching, and cater specifically to students and job seekers who need affordable, safe, long-term accommodation.",
    },
    {
        question: "What if I need a room urgently?",
        answer: "We have an 'Emergency Room Finder' feature specifically for this! When you select 'Emergency Room Needed', the system prioritizes showing you rooms that are immediately available and owners who can respond quickly. Many users have found accommodation within hours using this feature.",
    },
    {
        question: "How does the review system work?",
        answer: "After your stay or rental experience, you can rate and review landlords, rooms, tenants, and roommates. Reviews include star ratings and written feedback. This helps maintain transparency, prevents fraud, and helps future users make informed decisions. All reviews are from verified users only.",
    },
    {
        question: "Is my personal information safe?",
        answer: "Absolutely. We take privacy seriously. Your personal information is encrypted and stored securely. Our in-app messaging system means you never have to share your phone number until you're comfortable. Verification documents are only used for verification purposes and are handled with strict confidentiality.",
    },
    {
        question: "Can I list multiple properties?",
        answer: "Yes! Property owners can list multiple properties through a single account. Our landlord dashboard provides easy management tools for all your listings, including analytics, tenant applications, and messaging - all in one place.",
    },
]

// Trusted By / Press
export const trustedBy: TrustedByItem[] = [
    { name: "Featured Platform", icon: <Award className="w-6 h-6" /> },
    { name: "500+ 5-Star Reviews", icon: <Star className="w-6 h-6" /> },
    {
        name: "Verified & Secure",
        icon: <ShieldCheck className="w-6 h-6" />,
    },
    { name: "24/7 Support", icon: <Headphones className="w-6 h-6" /> },
]
