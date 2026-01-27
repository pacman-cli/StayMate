package com.webapp.domain.landlord.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.domain.booking.dto.BookingResponse;
import com.webapp.domain.booking.entity.Booking;
import com.webapp.domain.booking.repository.BookingRepository;
import com.webapp.domain.landlord.dto.LandlordOverviewDto;
import com.webapp.domain.landlord.dto.PropertySeatSummaryDto;
import com.webapp.domain.landlord.service.LandlordService;
import com.webapp.domain.property.dto.SeatDto;
import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.entity.Seat;
import com.webapp.domain.property.enums.SeatStatus;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.property.repository.SeatRepository;
import com.webapp.domain.review.repository.ReviewRepository;
import com.webapp.domain.user.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LandlordServiceImpl implements LandlordService {

  private final PropertyRepository propertyRepository;
  private final BookingRepository bookingRepository;
  private final SeatRepository seatRepository;
  private final ReviewRepository reviewRepository;

  @Override
  @Transactional(readOnly = true)
  public LandlordOverviewDto getOverview(User landlord) {
    long totalProperties = propertyRepository.countByOwnerId(landlord.getId());
    Long totalSeats = propertyRepository.sumBedsByOwnerId(landlord.getId());
    if (totalSeats == null)
      totalSeats = 0L;

    List<Booking> activeBookings = bookingRepository.findActiveBookingsByLandlordId(landlord.getId());
    long occupiedSeats = activeBookings.size();

    long vacantSeats = Math.max(0, totalSeats - occupiedSeats);
    long longTermVacant = 0; // Placeholder for complex logic

    double occupancyRate = totalSeats > 0 ? ((double) occupiedSeats / totalSeats) * 100.0 : 0.0;

    Double avgRating = reviewRepository.getAverageRatingByReceiverId(landlord.getId());
    int totalReviews = reviewRepository.findByReceiverIdOrderByCreatedAtDesc(landlord.getId()).size();

    return LandlordOverviewDto.builder()
        .totalProperties(totalProperties)
        .totalSeats(totalSeats)
        .occupiedSeats(occupiedSeats)
        .vacantSeats(vacantSeats)
        .longTermVacantSeats(longTermVacant)
        .occupancyRate(occupancyRate)
        .averageRating(avgRating != null ? avgRating : 0.0)
        .totalReviews(totalReviews)
        .build();
  }

  @Override
  @Transactional
  public List<PropertySeatSummaryDto> getPropertySummaries(User landlord) {
    List<Property> properties = propertyRepository.findAllByOwnerId(landlord.getId());
    List<PropertySeatSummaryDto> summaries = new ArrayList<>();

    for (Property p : properties) {
      // Lazy Seat Creation
      List<Seat> seats = seatRepository.findByPropertyId(p.getId());
      if (seats.isEmpty() && p.getBeds() > 0) {
        for (int i = 1; i <= p.getBeds(); i++) {
          Seat s = Seat.builder()
              .property(p)
              .label("Bed " + i)
              .status(SeatStatus.AVAILABLE)
              .build();
          seats.add(seatRepository.save(s));
        }
      } else if (seats.size() < p.getBeds()) {
        // Sync if beds increased
        for (int i = seats.size() + 1; i <= p.getBeds(); i++) {
          Seat s = Seat.builder()
              .property(p)
              .label("Bed " + i)
              .status(SeatStatus.AVAILABLE)
              .build();
          seats.add(seatRepository.save(s));
        }
      }

      // Calculate Status
      List<Booking> activeBookings = bookingRepository.findActiveBookingsByPropertyId(p.getId());
      int occupiedCount = activeBookings.size();

      List<SeatDto> seatDtos = new ArrayList<>();
      for (int i = 0; i < seats.size(); i++) {
        Seat s = seats.get(i);
        boolean isVirtualOccupied = (i < occupiedCount);

        seatDtos.add(SeatDto.builder()
            .id(s.getId())
            .label(s.getLabel())
            .status(s.getStatus())
            .isOccupiedByBooking(isVirtualOccupied)
            .build());
      }

      // Count effective available
      long availableBeds = seatDtos.stream()
          .filter(sd -> !sd.isOccupiedByBooking() && sd.getStatus() == SeatStatus.AVAILABLE)
          .count();

      summaries.add(PropertySeatSummaryDto.builder()
          .id(p.getId())
          .title(p.getTitle())
          .address(p.getLocation())
          .totalBeds(p.getBeds())
          .occupiedBeds(occupiedCount)
          // If seat is BLOCKED, it is not available.
          // If seat is OCCUPIED (virtual), it is not available.
          // available = total - occupied - blocked
          .availableBeds((int) availableBeds)
          .seats(seatDtos)
          .imageUrl(p.getImageUrl())
          .build());
    }

    // Optimization: Bulk fetch reviews to avoid N+1
    List<Long> propertyIds = properties.stream().map(Property::getId).collect(Collectors.toList());
    java.util.Map<Long, List<com.webapp.domain.review.dto.ReviewResponse>> reviewsByProperty = new java.util.HashMap<>();

    if (!propertyIds.isEmpty()) {
      List<com.webapp.domain.review.entity.Review> allReviews = reviewRepository.findByPropertyIdIn(propertyIds);
      for (com.webapp.domain.review.entity.Review r : allReviews) {
        reviewsByProperty.computeIfAbsent(r.getProperty().getId(), k -> new ArrayList<>())
            .add(com.webapp.domain.review.dto.ReviewResponse.builder()
                .id(r.getId())
                .authorId(r.getAuthor().getId())
                .authorName(r.getAuthor().getFullName())
                .authorAvatar(r.getAuthor().getProfilePictureUrl())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build());
      }
    }

    // Second Pass: Populate Status and Reviews
    for (PropertySeatSummaryDto dto : summaries) {
      dto.setReviews(reviewsByProperty.getOrDefault(dto.getId(), new ArrayList<>()));

      // Status determination logic:
      // Properties are "Booked" if they have the RENTED status (set by
      // BookingService)
      // Otherwise they are "Vacant"
      // We can also double check occupancy, but relying on Property status is
      // safer/cleaner with the new BookingService logic.
      Property p = properties.stream().filter(prop -> prop.getId().equals(dto.getId())).findFirst().orElse(null);
      if (p != null) {
        if (p.getStatus() == com.webapp.domain.property.enums.PropertyStatus.RENTED) {
          dto.setStatus("Booked");
        } else {
          dto.setStatus("Vacant");
        }
      } else {
        dto.setStatus("Vacant");
      }
    }

    return summaries;
  }

  @Override
  @Transactional
  public void toggleSeatAvailability(Long seatId, User landlord) {
    Seat seat = seatRepository.findById(seatId)
        .orElseThrow(() -> new RuntimeException("Seat not found"));

    if (!seat.getProperty().getOwner().getId().equals(landlord.getId())) {
      throw new RuntimeException("Unauthorized");
    }

    if (seat.getStatus() == SeatStatus.AVAILABLE) {
      seat.setStatus(SeatStatus.BLOCKED);
    } else if (seat.getStatus() == SeatStatus.BLOCKED) {
      seat.setStatus(SeatStatus.AVAILABLE);
    }
    seatRepository.save(seat);
  }

  @Override
  @Transactional(readOnly = true)
  public List<BookingResponse> getBookingRequests(User landlord) {
    return bookingRepository
        .findIncomingRequests(landlord.getId(), org.springframework.data.domain.PageRequest.of(0, 50))
        .stream()
        .map(this::mapToBookingResponse)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<com.webapp.domain.review.dto.ReviewResponse> getReviews(User landlord) {
    return reviewRepository.findByReceiverIdOrderByCreatedAtDesc(landlord.getId()).stream()
        .map(r -> com.webapp.domain.review.dto.ReviewResponse.builder()
            .id(r.getId())
            .authorId(r.getAuthor().getId())
            .authorName(r.getAuthor().getFullName())
            .authorAvatar(r.getAuthor().getProfilePictureUrl())
            .receiverId(r.getReceiver().getId())
            .propertyId(r.getProperty() != null ? r.getProperty().getId() : null)
            .rating(r.getRating())
            .comment(r.getComment())
            .createdAt(r.getCreatedAt())
            .build())
        .collect(Collectors.toList());
  }

  // Duplicated mapper from DashboardService usually, but simple enough to inline
  private BookingResponse mapToBookingResponse(Booking booking) {
    return BookingResponse.builder()
        .id(booking.getId())
        .tenantName(booking.getTenant() != null ? booking.getTenant().getFullName() : "Unknown")
        .tenantProfilePictureUrl(booking.getTenant() != null ? booking.getTenant().getProfilePictureUrl() : null)
        .startDate(booking.getStartDate())
        .endDate(booking.getEndDate())
        .status(booking.getStatus())
        .createdAt(booking.getCreatedAt())
        .build();
  }
}
