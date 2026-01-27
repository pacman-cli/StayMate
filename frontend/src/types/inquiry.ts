export type InquiryStatus = "PENDING" | "REPLIED" | "CLOSED"

export interface InquiryResponse {
    id: number
    propertyId: number
    propertyTitle: string
    propertyImage: string | null

    senderId: number
    senderName: string
    senderEmail: string
    senderProfilePictureUrl: string | null

    message: string
    reply: string | null
    status: InquiryStatus
    createdAt: string
}

export interface CreateInquiryRequest {
    propertyId: number
    message: string
}

export interface ReplyInquiryRequest {
    reply: string
}
