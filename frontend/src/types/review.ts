export interface ReviewResponse {
    id: number
    authorId: number
    authorName: string
    authorAvatar?: string
    receiverId: number
    propertyId?: number
    rating: number
    comment: string
    createdAt: string
}
